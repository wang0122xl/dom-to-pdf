/*
 * @Date: 2022-03-11 16:20:55
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2022-03-17 13:15:51
 * @Description: file content
 */
import jspdf from 'jspdf'
import * as htmlToImage from 'html-to-image/es'

// pdf纸张尺寸，单位mm
type PDFSize = {
    width: number
    height: number
}
export const A4Size: PDFSize = {
    width: 210,
    height: 297
}
export const A5Size: PDFSize = {
    width: 148,
    height: 210
}
type ExtraRenderFunction = (pdf: jspdf, currentPage: number) => void

type PDFPadding = [top: number, right: number, bottom: number, left: number]

const defaultIsSeperatorCallback = (ele: HTMLElement) => {
    return ele.classList.contains('pdf-seperator')
}

const defaultIsPDFTableCallback = (ele: HTMLTableElement) => {
    return ele.classList.contains('pdf-table')
}

/**
  * @param {boolean} [inOnePdf = false] 多个元素是否生成在一个pdf中
  * @param {boolean} isSeperatorCallback 判断元素是否作为换页元素，该元素渲染后立即换页
  * @param {boolean} lastElementOnBottom 控制最后一个元素是否位于当页最下方，只有当lastElementAsFooter = false时有效
  * @param {boolean} isPdfTableCallback 判断table是否需要特殊处理：td，th独立换页逻辑
  * @param {PDFSize} [size = A4Size] pdf尺寸
  * @param {PDFPadding} [padding = [0, 0, 0, 0]] pdf内边距，尺寸为实际的pt值，[上，右，下，左]
  * @param {ExtraRenderFunction} renderPageHeader 自定义pdf页眉
  * @param {ExtraRenderFunction} renderPageFooter 自定义pdf页脚
  * @param {boolean} [firstElementAsHeader = true] 首元素是否当做页眉处理，true：分页时首元素始终绘制与最顶部
  * @param {boolean} [lastElementAsFooter = true] 末元素是否当做页脚处理，true：分页时末元素始终绘制于最底部
  * @param {boolean} [stickyTableHeader = true] 命中的table元素表头换页时是否显示在最上面 
*/
type DomToPDFProps = {
    inOnePdf?: boolean
    lastElementOnBottom?: boolean
    isSeperatorCallback?: (ele: HTMLElement) => boolean
    isPdfTableCallback?: (ele: HTMLTableElement) => boolean
    size?: PDFSize
    padding?: PDFPadding
    renderPageHeader?: ExtraRenderFunction
    renderPageFooter?: ExtraRenderFunction
    firstElementAsHeader?: boolean
    lastElementAsFooter?: boolean
    stickyTableHeader?: boolean
}
class DomToPdf {
    static TransformingClassName = 'dom-to-pdf-transforming'
    private heitiString?: any

    private async loadFont() {
        const { heitiString } = await import('./heiti.js')
        this.heitiString = heitiString
    }

    constructor() {

    }

    /**
     * @description: 创建jspdf对象，或返回原有jspdf
     * @param {PDFSize} size
     * @param {jspdf} pdf
     * @return {jspdf}
     */
    private async createPdfIfNotExisted(size?: PDFSize, pdf?: jspdf) {
        let resultPdf = pdf
        const actualSize = size || A4Size

        if (!this.heitiString) {
            await this.loadFont()
        }
        if (!resultPdf) {
            resultPdf = new jspdf('p', 'mm', [actualSize.width, actualSize.height])
            resultPdf.addFileToVFS('heiti.ttf', this.heitiString)
            resultPdf.addFont('heiti.ttf', 'heiti', 'normal')
            resultPdf.setFont('heiti')
        }
        return resultPdf
    }

    private async promisifyCreateImage(src: string): Promise<HTMLImageElement> {
        return new Promise(resolve => {
            const img = document.createElement('img')
            img.src = src
            img.onload = function () {
                resolve(img)
            }
        })
    }

    private objectIs(obj: Object, target: string) {
        return Object.prototype.toString.call(obj) === `[object ${target}]`
    }

    private recursiveFindClass(ele: HTMLElement | null, target: string, originEle: HTMLElement): null | HTMLElement {
        if (!ele) {
            return null
        }
        if (this.objectIs(ele, target)) {
            return ele
        }
        return this.recursiveFindClass(ele.parentElement, target, originEle)
    }

    private recursiveFindTagName(ele: HTMLElement | null, target: string, originEle: HTMLElement): null | HTMLElement {
        if (!ele) {
            return null
        }
        if (ele.tagName === target) {
            return ele
        }
        return this.recursiveFindTagName(ele.parentElement, target, originEle)
    }

    private async pdfAddEle(props: Omit<DomToPDFProps, 'size' | 'inOnePdf'> & {
        pdf: jspdf
        element: HTMLElement
        top: number
        left: number,
        width: number,
        height: number,
        page: number
    }) {
        return Promise.resolve().then(() => {
            const marginTop = props.element.style.marginTop
            const marginBottom = props.element.style.marginBottom
            props.element.style.marginTop = '0'
            props.element.style.marginBottom = '0'
            return htmlToImage
                .toSvg(props.element, { quality: 1 })
                .then(imgData => this.promisifyCreateImage(imgData))
                .then(img => {
                    props.pdf.setPage(props.page)
                    props.element.style.marginTop = marginTop
                    props.element.style.marginBottom = marginBottom
                    const canvas = document.createElement('canvas')
                    canvas.width = img.width * 2
                    canvas.height = img.height * 2
                    const context = canvas.getContext('2d')!
                    context.fillStyle = '#fff'
                    context.fillRect(0, 0, canvas.width, canvas.height)

                    context.drawImage(img, 0, 0, canvas.width, canvas.height)
                    const src = canvas.toDataURL('image/jpeg', 1)
                    props.pdf.addImage(src, 'JPEG', props.left, props.top, props.width, props.height)
                })
        })
    }

    /**
     * @description: 将dom元素转换成pdf
     * @param {HTMLDivElement[]} elements 需要转换成pdf的所有div
     * @return {Promise<jspdf[]>} 返回
     */
    public async transformToPdf(props: Omit<DomToPDFProps, 'inOnePdf'> & {
        pdf?: jspdf
        element: HTMLDivElement
        startPage?: number
    }): Promise<{
        pdf: jspdf,
        pages: number
    }> {
        const self = this
        props.element.classList.add(DomToPdf.TransformingClassName)
        const {
            isSeperatorCallback = defaultIsSeperatorCallback,
            isPdfTableCallback = defaultIsPDFTableCallback,
            lastElementOnBottom = true,
            firstElementAsHeader = true,
            lastElementAsFooter = true,
            element,
            size = A4Size,
            padding = [0, 0, 0, 0],
            renderPageHeader,
            renderPageFooter,
            stickyTableHeader = true,
            startPage = 0
        } = props
        // pdf宽度
        const pdfWidth = size.width - padding[1] - padding[3]

        const parentRect = element.getBoundingClientRect()

        // 元素位于pdf上的y位置
        let top: number = 0;
        // 元素位于pdf上的x位置
        const left = padding[3]

        const childrenElements = element.children as unknown as HTMLElement[]
        if (element.children.length < 2) {
            throw new Error(`element: ${element} has less than 2 child nodes`)
        }
        const firstEle = element.children[0] as HTMLElement
        const secondEle = element.children[1] as HTMLElement
        const lastEle = element.children[element.children.length - 1] as HTMLElement
        const lastSecondEle = element.children[element.children.length - 2] as HTMLElement
        const {
            y: firstEleY,
            height: firstEleHeight
        } = calculateBoundingRect(firstEle)
        const {
            y: lastEleY,
            height: lastEleHeight
        } = calculateBoundingRect(lastEle)
        const {
            y: secondEleY,
            height: secondEleHeight
        } = calculateBoundingRect(secondEle)
        const {
            y: lastSecondEleY,
            height: lastSecondEleHeight
        } = calculateBoundingRect(lastSecondEle)

        const lastOffsetY = lastEleY - lastSecondEleY - lastSecondEleHeight
        const firstOffsetY = secondEleY - firstEleY - firstEleHeight

        let currentPage = 1
        const pdf = await this.createPdfIfNotExisted(size, props.pdf)

        function calculateBoundingRect(ele: HTMLElement): Pick<DOMRect, 'width' | 'y' | 'height'> {
            const rect = ele.getBoundingClientRect()
            return {
                y: calculateLength(rect.y),
                height: calculateLength(rect.height),
                width: calculateLength(rect.width)
            }
        }

        /**
         * @description: 首元素初始化
         * @return {*}
         */
        function initializePage() {
            top = firstEleY - calculateLength(parentRect.y) + padding[0]
        }

        /**
         * @description: px等比转换至pt
         * @param {number} length 要转换的px值
         * @param {HTMLElement} element 容器element
         * @return {number} pt值
       */
        function calculateLength(length: number) {
            return (size.width / parentRect.width) * length
        }

        /**
         * @description: 检查子元素布局是否会超出当前pdf页尺寸
         * @param {HTMLElement} ele
         * @return {*}
         */
        function checkOversize(ele: HTMLElement) {
            const isFirst = ele === firstEle
            const isLast = ele === lastEle
            const rect = calculateBoundingRect(ele)
            let total = rect.height + padding[0] + padding[2]
            if (firstElementAsHeader && !isFirst) {
                total += firstEleHeight + firstEleY - calculateLength(parentRect.y) + firstOffsetY
            }
            if (lastElementAsFooter && !isLast) {
                total += lastOffsetY + lastEleHeight
            }
            if (total > size.height) {
                console.error(ele)
                throw new Error('element 超出pdf最大高度')
            }

            let bottomY = top + rect.height + padding[2]
            if (lastElementAsFooter) {
                bottomY += lastEleHeight + lastOffsetY
            }
            return size.height - bottomY
        }

        function createNewPage(self: DomToPdf, inTable?: boolean, currentEle?: HTMLElement) {
            if (lastElementAsFooter) {
                promises.push(self.pdfAddEle({
                    pdf,
                    element: lastEle,
                    top: lastEleAsFooterY,
                    left,
                    width: pdfWidth,
                    height: lastEleHeight,
                    page: currentPage + startPage
                }))
            }

            currentPage++
            pdf.addPage()
            initializePage()
            renderPageHeader?.(pdf, currentPage)
            renderPageFooter?.(pdf, currentPage)
            if (firstElementAsHeader) {
                promises.push(self.pdfAddEle({
                    pdf,
                    element: firstEle,
                    top,
                    left,
                    width: pdfWidth,
                    height: firstEleHeight,
                    page: currentPage + startPage
                }))
                top += secondEleY - firstEleY
            }

            if (inTable && self.objectIs(currentEle!, 'HTMLTableRowElement') && stickyTableHeader) {
                const inHead = !!self.recursiveFindTagName(currentEle!, 'THEAD', currentEle!)

                if (!inHead) {
                    const table = self.recursiveFindClass(currentEle!, 'HTMLTableElement', currentEle!)!
                    const headTr = table.querySelector('thead > tr') as HTMLElement
                    const bodyTr = table.querySelector('tbody > tr')! as HTMLElement
                    const {
                        y: headTrY,
                        height: headTrHeight
                    } = calculateBoundingRect(headTr)
                    const {
                        y: bodyTrY
                    } = calculateBoundingRect(bodyTr)
                    promises.push(self.pdfAddEle({
                        pdf,
                        element: headTr,
                        top,
                        left,
                        width: pdfWidth,
                        height: headTrHeight,
                        page: currentPage + startPage
                    }))
                    top += bodyTrY - headTrY
                }
            }
        }

        initializePage()

        const promises: Promise<void>[] = []

        const lastEleAsFooterY = size.height - padding[2] - lastEleHeight

        function handleChildEle(childEle: HTMLElement, i: number, parentChildren: HTMLElement[], inTable?: boolean, extraOffsetY?: number) {
            const {
                height: eleHeight,
                y: eleY
            } = calculateBoundingRect(childEle)

            const isTable = 
                Object.prototype.toString.call(childEle) === '[object HTMLTableElement]' &&
                isPdfTableCallback(childEle as HTMLTableElement)
            if (isTable) {
                let offsetY
                const trs = childEle.querySelectorAll('tr') as unknown as HTMLElement[]
                if (i < parentChildren.length - 1) {
                    offsetY = calculateLength(
                        parentChildren[i + 1].getBoundingClientRect().y -
                        trs[trs.length - 1].getBoundingClientRect().y
                    )
                }
                for (let i = 0; i < trs.length; i++) {
                    const tr = trs[i]
                    handleChildEle(tr, i, trs, true, offsetY)
                }
                return
            }

            // y轴差值
            const dValue = checkOversize(childEle)

            // 元素跨页
            if (dValue < 0) {
                createNewPage(self, inTable, childEle)
            }
            let originTop = top
            
            if (i < parentChildren.length - 1) {
                top += calculateLength(parentChildren[i + 1].getBoundingClientRect().y) - eleY
            } else if (inTable) {
                top += extraOffsetY || 0
            }

            if (i === parentChildren.length - 1 && !inTable) {
                if (lastElementAsFooter || lastElementOnBottom) {
                    originTop = lastEleAsFooterY
                }
            }
            promises.push(self.pdfAddEle({
                pdf,
                element: childEle,
                top: originTop,
                left,
                width: pdfWidth,
                height: eleHeight,
                page: currentPage + startPage
            }))
            if (isSeperatorCallback(childEle)) {
                createNewPage(self)
            }
        }

        renderPageHeader?.(pdf, 1)
        renderPageFooter?.(pdf, 1)

        for (let i = 0; i < childrenElements.length; i++) {
            const childEle = element.children[i] as HTMLElement
            handleChildEle(childEle, i, childrenElements, )
        }

        await Promise.all(promises)

        props.element.classList.remove(DomToPdf.TransformingClassName)

        return {
            pdf,
            pages: currentPage
        }
    }


    public async transformToPdfs(props: DomToPDFProps & {
        elements: HTMLDivElement[]
    }): Promise<jspdf[]> {
        const {
            inOnePdf = true,
            elements,
            ...restProps
        } = props

        const pdfs: jspdf[] = []
        const defaultPdf = await this.createPdfIfNotExisted(restProps.size)
        let totalPages = 0
        for (let i = 0; i < elements.length; i ++) {
            if (i > 0 && inOnePdf) {
                defaultPdf.addPage()
            }
            const ele = elements[i]
            const pdf = await this.createPdfIfNotExisted(restProps.size, inOnePdf ? defaultPdf : undefined)
            const {
                pdf: resultPdf,
                pages
            } = await this.transformToPdf({
                ...restProps,
                element: ele,
                pdf: pdf,
                startPage: inOnePdf ? totalPages : 0
            })
            totalPages += pages
            pdfs.push(resultPdf)
        }

        return inOnePdf ? [pdfs[0]] : pdfs
    }
}


export default DomToPdf
