/*
 * @Date: 2022-03-11 15:22:08
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2022-03-14 21:59:35
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
        for (let i = 0; i < 14; i++) {
            
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
            padding: [1, 30, 15, 30]
        })
        _print(pdf)
        console.log(pdf)
    }

    return (
        <div id='print-container'>
            <div className={`print-layer a4`} id='test'>
                <div className='text-24px h-24px font-500 text-[#333] text-center mt-0px bg-red-400'>
                    dom-to-pdf
                </div>
                {items.map((c, index) => (
                    <div key={index} style={{
                        backgroundColor: c,
                        width: '100%',
                        height: '60px',
                        marginTop: 5,
                        marginBottom: 15,
                        lineHeight: '60px'
                    }}>{index}</div>
                ))}
            </div>
                
            <div className='flex justify-center mb-10vh'>
                <Button type='primary' onClick={_download}>打印</Button>
            </div>

        </div>
    )
}

export default App