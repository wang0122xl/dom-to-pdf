/*
 * @Date: 2022-03-11 16:20:55
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2022-03-11 17:20:26
 * @Description: file content
 */
import jspdf from 'jspdf'

type PDFSize = {
    width: number
    height: number
}
const A4Size: PDFSize = {
    width: 595,
    height: 841
}
const A5Size: PDFSize = {
    width: 419.527,
    height: 595.275
}

type ExtraRenderFunction = (pdf: jspdf, currentPage: number) => void

type PDFPadding = [top: number, right: number, bottom: number, left: number]

class DomToPdf {
    constructor () {

    }
    /**
     * @description: 
     * @param {HTMLDivElement} element
     * @return {*}
     */
    public async getResult (element: HTMLDivElement) {
        
    }

    /**
     * @description: 将dom元素转换成pdf
     * @param {HTMLDivElement[]} elements 需要转换成pdf的所有div
     * @param {boolean} [inOnePdf = false] 多个元素是否生成在一个pdf中
     * @param {PDFSize} [size = A4Size] pdf尺寸
     * @param {string[]} titles 生成的pdf名称
     * @param {PDFPadding} [padding = [15, 30, 10, 30]] pdf内边距 [上，右，下，左]
     * @param {ExtraRenderFunction} renderPageHeader 自定义pdf页眉
     * @param {ExtraRenderFunction} renderPageFooter 自定义pdf页脚
     * @param {string} [tableClass = 'pdf-table'] 需要当做table处理的元素类名，默认pdf-table
     * @param {boolean} [noStickyTableHeader = true] 命中的table元素表头换页时是否显示在最上面
     * 
     * @return {Promise<jspdf[]>} 返回
     */    
    public async transformToPdf (props: {
        elements: HTMLDivElement[],
        inOnePdf?: boolean,
        size?: PDFSize
        titles?: string[]
        padding?: PDFPadding
        renderPageHeader?: ExtraRenderFunction
        renderPageFooter?: ExtraRenderFunction
        tableClass?: string
        noStickyTableHeader?: boolean
    }): Promise<jspdf[]> {
        const {
            elements,
            inOnePdf = false,
            size = A4Size,
            titles = [],
            padding = [15, 30, 10, 30],
            renderPageHeader,
            renderPageFooter,
            tableClass = 'pdf-table',
            noStickyTableHeader = true

        } = props
        
        return Promise.resolve([])
    }
}

export default DomToPdf
