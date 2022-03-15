/*
 * @Date: 2022-03-11 15:22:08
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2022-03-15 15:18:00
 * @Description: file content
 */
import React, { useMemo } from 'react'
import { Button, Spin } from 'antd'
import 'antd/es/button/style/index'
import './App.less'

import jsPDF from 'jspdf'
import DomToPdf from '../src/index'

export type PDFPreviewType = 'download' | 'print' | 'all'

const App = () => {
    const items = useMemo(() => {
        const result: string[] = []
        for (let i = 0; i < 25; i++) {
            
            result.push(`rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`)
            
        }
        return result
    }, [])

    const _print = (pdf: jsPDF) => {
        const w = window.open()!
        const iframe = document.createElement('iframe')
        iframe.hidden = true
        iframe.src = URL.createObjectURL(pdf.output('blob'))
        w.document.body.appendChild(iframe)
        iframe.contentWindow?.print()
    }

    const _download = async () => {
        const domToPdf = new DomToPdf()
        const pdf = await domToPdf.transformToPdf({
            element: document.getElementById('test')! as HTMLDivElement,
            padding: [0, 10, 5, 10],
            isSeperatorCallback: ele => {
                return ele.innerHTML === '8'
            },
            renderPageFooter: (pdf, currentPage) => {
                pdf
                    .setTextColor('#111')
                    .setFontSize(8)
                    .text(`第${currentPage}页`, pdf.internal.pageSize.getWidth() - 17, pdf.internal.pageSize.getHeight() - 1)
            },
        })
        _print(pdf)
    }

    return (
        <div id='print-container'>
            <div className={`print-layer a4`} id='test'>
                <div className='text-24px h-24px font-500 text-[#333] text-center mt-10px bg-red-400'>
                    dom-to-pdf
                </div>
                {items.map((c, index) => (
                    <div key={index} style={{
                        backgroundColor: c,
                        // width: '100%',
                        height: '60px',
                        marginTop: 5,
                        marginBottom: 15,
                        lineHeight: '60px'
                    }}>{index}</div>
                ))}
                <div className='text-15px h-24px font-500 text-[#333] my-10px border-1px border-solid border-[#ccc] border-l-0 border-r-0 py-20px flex items-center justify-between'>
                    <span>这是一个footer</span>
                    <span>{new Date().toDateString()}</span>
                </div>
            </div>
                
            <div className='flex justify-center mb-10vh'>
                <Button type='primary' onClick={_download}>打印</Button>
            </div>

        </div>
    )
}

export default App