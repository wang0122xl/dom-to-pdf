/*
 * @Date: 2022-03-11 16:20:55
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2022-03-15 14:03:59
 * @Description: file content
 */
import jspdf from 'jspdf'
import * as htmlToImage from 'html-to-image/es'

type PDFSize = {
    width: number
    height: number
}
const A4Size: PDFSize = {
    width: 210,
    height: 297
}
const A5Size: PDFSize = {
    width: 419.527,
    height: 595.275
}
type ExtraRenderFunction = (pdf: jspdf, currentPage: number) => void

type PDFPadding = [top: number, right: number, bottom: number, left: number]

/**
  * @param {boolean} [inOnePdf = false] 多个元素是否生成在一个pdf中
  * @param {boolean} [seperate = true] 多元素生成在一个pdf，元素间是否换页
  * @param {PDFSize} [size = A4Size] pdf尺寸
  * @param {PDFPadding} [padding = [0, 0, 0, 0]] pdf内边距，尺寸为实际的pt值，[上，右，下，左]
  * @param {ExtraRenderFunction} renderPageHeader 自定义pdf页眉
  * @param {ExtraRenderFunction} renderPageFooter 自定义pdf页脚
  * @param {boolean} [firstElementAsHeader = true] 首元素是否当做页眉处理，true：分页时首元素始终绘制与最顶部
  * @param {boolean} [lastElementAsFooter = true] 末元素是否当做页脚处理，true：分页时末元素始终绘制于最底部
  * @param {string} [tableClass = 'pdf-table'] 需要当做table处理的元素类名，默认pdf-table
  * @param {boolean} [noStickyTableHeader = true] 命中的table元素表头换页时是否显示在最上面 
*/
type DomToPDFProps = {
    inOnePdf?: boolean
    seperate?: boolean
    size?: PDFSize
    padding?: PDFPadding
    renderPageHeader?: ExtraRenderFunction
    renderPageFooter?: ExtraRenderFunction
    firstElementAsHeader?: boolean
    lastElementAsFooter?: boolean
    tableClass?: string
    noStickyTableHeader?: boolean
}
class DomToPdf {
    private heitiString?: any

    private async loadFont () {
        const { heitiString } = await import('./heiti.js')
        this.heitiString = heitiString
    }

    constructor() {
        
    }
    /**
     * @description: 
     * @param {HTMLDivElement} element
     * @return {*}
     */
    public async getResult(element: HTMLDivElement) {

    }

    /**
     * @description: 创建jspdf对象，或返回原有jspdf
     * @param {PDFSize} size
     * @param {jspdf} pdf
     * @return {jspdf}
     */
    private async createPdfIfNotExisted(size: PDFSize, pdf?: jspdf) {
        let resultPdf = pdf

        if (!this.heitiString) {
            await this.loadFont()
        }
        if (!resultPdf) {
            resultPdf = new jspdf('p', 'mm', [size.width, size.height])
            resultPdf.addFileToVFS('heiti.ttf', this.heitiString)
            resultPdf.addFont('heiti.ttf', 'heiti', 'normal')
            resultPdf.setFont('heiti')
        }
        return resultPdf
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
        const marginTop = props.element.style.marginTop
        const marginBottom = props.element.style.marginBottom
        props.element.style.marginTop = '0'
        props.element.style.marginBottom = '0'
        const imgData = await htmlToImage.toPng(props.element, {
            quality: 1
        })
        props.element.style.marginTop = marginTop
        props.element.style.marginBottom = marginBottom
        props.pdf.setPage(props.page)
        const img = document.createElement('img')
        img.src = imgData
        props.pdf.addImage(imgData, 'PNG', props.left, props.top, props.width, props.height)
    }

    /**
     * @description: 将dom元素转换成pdf
     * @param {HTMLDivElement[]} elements 需要转换成pdf的所有div
     * @return {Promise<jspdf[]>} 返回
     */
    public async transformToPdf(props: DomToPDFProps & {
        pdf?: jspdf
        element: HTMLDivElement
    }): Promise<jspdf> {
        const {
            inOnePdf = false,
            seperate = true,
            firstElementAsHeader = true,
            lastElementAsFooter = true,
            element,
            size = A4Size,
            padding = [0, 0, 0, 0],
            renderPageHeader,
            renderPageFooter,
            tableClass = 'pdf-table',
            noStickyTableHeader = true
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
                console.log(lastOffsetY, lastEleHeight, 'kk', bottomY)
                bottomY += lastEleHeight + lastOffsetY
            }
            return size.height - bottomY
        }
        
        initializePage()

        const promises: Promise<void>[] = []
        renderPageFooter?.(pdf, 1)

        const lastEleAsFooterY = size.height - padding[2] - lastEleHeight

        for (let i = 0; i < childrenElements.length; i++) {
            const childEle = element.children[i] as HTMLElement
            const {
                height: eleHeight,
                y: eleY
            } = calculateBoundingRect(childEle)

            // y轴差值
            const dValue = checkOversize(childEle)

            // 元素跨页
            if (dValue < 0) {
                if (lastElementAsFooter) {
                    promises.push(this.pdfAddEle({
                        pdf,
                        element: lastEle,
                        top: lastEleAsFooterY,
                        left,
                        width: pdfWidth,
                        height: lastEleHeight,
                        page: currentPage
                    }))
                }
                renderPageFooter?.(pdf, pdf.getCurrentPageInfo().pageNumber)
                
                currentPage ++
                pdf.addPage()
                initializePage()
                renderPageHeader?.(pdf, pdf.getCurrentPageInfo().pageNumber)
                if (firstElementAsHeader) {
                    promises.push(this.pdfAddEle({
                        pdf,
                        element: firstEle,
                        top,
                        left,
                        width: pdfWidth,
                        height: firstEleHeight,
                        page: currentPage
                    }))
                    top += firstOffsetY + firstEleHeight
                }

            }
            console.log(childEle.innerHTML, currentPage, dValue)
            const originTop = top
            if (i < childrenElements.length - 1) {
                top += calculateLength(childrenElements[i + 1].getBoundingClientRect().y) - eleY
            }
            promises.push(this.pdfAddEle({
                pdf,
                element: childEle,
                top: (i === childrenElements.length - 1 && lastElementAsFooter) ?
                   lastEleAsFooterY :
                   originTop,
                left,
                width: pdfWidth,
                height: eleHeight,
                page: currentPage
            }))
            // promises.push(this.pdfAddEle({
            //     pdf,
            //     element: childEle,
            //     top: top,
            //     left,
            //     width: pdfWidth,
            //     height: eleHeight,
            //     page: currentPage
            // }))
            // top += calculateLength(childEle.offsetHeight)
        }
        renderPageFooter?.(pdf, 1)

        await Promise.all(promises)

        return pdf
    }
}

export default DomToPdf
