/*
 * @Date: 2022-03-11 15:22:08
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2022-03-17 10:36:57
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
        const getRandom = () => {
            return Math.round(Math.random() * 255)
        }
        const result: string[] = []
        for (let i = 0; i < 11; i++) {
            
            result.push(`rgb(${getRandom()}, ${getRandom()}, ${getRandom()})`)
            
        }
        return result
    }, [])

    const _getPdfs = async () => {
        const domToPdf = new DomToPdf()
        const pdfs = await domToPdf.transformToPdfs({
            elements: [
                document.getElementById('test')! as HTMLDivElement,
                document.getElementById('test1')! as HTMLDivElement
            ],
            padding: [0, 10, 5, 10],
            // isSeperatorCallback: ele => {
            //     return ele.innerHTML === '8'
            // },
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
        const pdfs = await _getPdfs()
        for (const pdf of pdfs) {
            const w = window.open()!
            const iframe = document.createElement('iframe')
            iframe.hidden = true
            iframe.src = URL.createObjectURL(pdf.output('blob'))
             w.document.body.appendChild(iframe)
            iframe.contentWindow?.print()
        }
    }

    const doDownload = async () => {
        const pdfs = await _getPdfs()
        for (const pdf of pdfs) {
            pdf.save('test')
        }
    }

    return (
        <div id='print-container'>
            <div className={`print-layer a4`} id='test'>
                <div className='text-24px h-24px font-500 text-[#333] text-center mt-10px bg-red-400'>
                    dom-to-pdf
                </div>
                {items.map((c, index) => (
                    <div key={index} className='border-1px border-solid border-[#000]' style={{
                        backgroundColor: c,
                        // width: '100%',
                        height: '60px',
                        marginTop: 5,
                        marginBottom: 15,
                        lineHeight: '60px'
                    }}>{index}</div>
                ))}
                <table className='pdf-table'>
                    <thead>
                        <tr>
                            <th>title</th>
                            <th>content</th>
                            <th>index</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        items.map((c, index) => (
                            <tr>
                                <td colSpan={1}>{c}</td>
                                <td colSpan={1}>
                                    <div
                                        className='w-100px mx-auto h-35px'
                                        style={{
                                            backgroundColor: c
                                        }}
                                    />
                                </td>
                                <td colSpan={1}>{index}</td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
                {items.map((c, index) => (
                    <div key={index + '-next'} className='border-1px border-solid border-[#000]' style={{
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

            <div className={`print-layer a4`} id='test1'>
                <div className='text-24px h-24px font-500 text-[#333] text-center mt-10px bg-red-400'>
                    dom-to-pdf1
                </div>
                {items.map((c, index) => (
                    <div key={`test1-${index}`} className='border-1px border-solid border-[#000]' style={{
                        backgroundColor: c,
                        // width: '100%',
                        height: '50px',
                        marginTop: 5,
                        marginBottom: 15,
                        lineHeight: '50px'
                    }}>{index}</div>
                ))}
                <table className='pdf-table'>
                    <thead>
                        <tr>
                            <th>title1</th>
                            <th>content1</th>
                            <th>index1</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        items.map((c, index) => (
                            <tr>
                                <td colSpan={1}>{c}</td>
                                <td colSpan={1}>
                                    <div
                                        className='w-100px mx-auto h-35px'
                                        style={{
                                            backgroundColor: c
                                        }}
                                    />
                                </td>
                                <td colSpan={1}>{index}</td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
                {items.map((c, index) => (
                    <div key={index + '-next'} className='border-1px border-solid border-[#000]' style={{
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
                
            <div className='flex justify-center mb-10vh space-x-25px'>
                <Button type='primary' onClick={doDownload}>下载</Button>
                <Button type='primary' onClick={doPrint}>打印</Button>
            </div>

        </div>
    )
}

export default App