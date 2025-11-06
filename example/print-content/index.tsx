/*
 * @Date: 2022-03-17 11:34:36
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2022-05-26 14:58:22
 * @Description: file content
 */

import { useMemo } from "react"

const PrintContent = (props: {
    id: string
}) => {
    const items = useMemo(() => {
        const getRandom = () => {
            return Math.round(Math.random() * 255)
        }
        const result: string[] = []
        for (let i = 0; i < 18; i++) {

            result.push(`rgb(${getRandom()}, ${getRandom()}, ${getRandom()})`)

        }
        return result
    }, [])
    return (
        <div className={`print-layer a4`} id={props.id}>
            <div className='text-24px h-24px font-500 text-[#333] text-center mt-10px bg-red-400'>
                dom-to-pdf
            </div>
            <img src='https://rpfield-zlerp.oss-cn-beijing.aliyuncs.com/test/sys_config/image/20210928/152a412d1d00e26020afd9e0f0d0081d.jpg' />

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


    )
}

export default PrintContent
