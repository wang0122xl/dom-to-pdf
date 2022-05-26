/*
 * @Date: 2022-03-11 15:22:08
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2022-05-26 14:59:04
 * @Description: file content
 */
import { Button, Spin } from 'antd'
import 'antd/es/button/style/index'
import './App.less'

import DomToPdf, { A5Size } from '../src/index'
import PrintContent from './print-content'

export type PDFPreviewType = 'download' | 'print' | 'all'

const App = () => {

    const _getPdfs = async () => {
        const domToPdf = new DomToPdf()
        const pdfs = await domToPdf.transformToPdfs({
            elements: [
                document.getElementById('test')! as HTMLDivElement,
                document.getElementById('test1')! as HTMLDivElement
            ],
            padding: [0, 10, 5, 10],
            // size: A5Size,
            // isSeperatorCallback: ele => {
            //     return ele.innerHTML === '3'
            // },
            // inOnePdf: false,
            // firstElementAsHeader: false,
            // lastElementAsFooter: false,
            renderPageHeader: (pdf, currentPage) => {
                pdf
                    .setTextColor('#111')
                    .setFontSize(8)
                    .text(`页眉${currentPage}`, 10, 4)
            },
            renderPageFooter: (pdf, currentPage) => {
                pdf
                    .setTextColor('#111')
                    .setFontSize(8)
                    .text(`第${currentPage}页`, pdf.internal.pageSize.getWidth() - 17, pdf.internal.pageSize.getHeight() - 1)
            },
        })
        return pdfs
    }

    const doPrint = async () => {
        const res = await _getPdfs()
        for (const item of res) {
            item.doPrint(false)
        }
    }

    const doDownload = async () => {
        const res = await _getPdfs()
        for (const item of res) {
            item.pdf.save('test')
        }
    }

    return (
        <div id='print-container'>
            <PrintContent id='test' />
            <PrintContent id='test1' />
                
            <div className='flex justify-center mb-10vh space-x-25px'>
                <Button type='primary' onClick={doDownload}>下载</Button>
                <Button type='primary' onClick={doPrint}>打印</Button>
            </div>

        </div>
    )
}

export default App