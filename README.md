<!--
 * @Date: 2022-03-16 15:14:33
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2022-03-17 14:52:49
 * @Description: file content
-->
# dom-to-pdf
## TODO
* 额外页眉页脚使用html dom实现

## Install
> yarn add element-to-pdf

## Usage
``` typescript
const pdfs = await domToPdf.transformToPdfs({
    elements: [
        document.getElementById('test')! as HTMLDivElement,
        document.getElementById('test1')! as HTMLDivElement
    ],            
})
pdfs.forEach(pdf => {
    // download
    pdf.save('demo.pdf')
    /** print
    const w = window.open()!
    const iframe = document.createElement('iframe')
    iframe.hidden = true
    iframe.src = URL.createObjectURL(pdf.output('blob'))
    w.document.body.appendChild(iframe)
    iframe.contentWindow?.print()
    */
})
```

## Options
```typescript
/**
  * @param {boolean} [inOnePdf = false] 多个元素是否生成在一个pdf中
  * @param {boolean} isSeperatorCallback 判断元素是否作为换页元素，该元素转换后立即换页
  * @param {boolean} lastElementOnBottom 控制最后一个元素是否位于当页最下方，只有当lastElementAsFooter = false时有效
  * @param {boolean} isPdfTableCallback 判断table是否需要特殊处理：td，th独立换页逻辑
  * @param {PDFSize} [size = A4Size] pdf尺寸
  * @param {PDFPadding} [padding = [0, 0, 0, 0]] pdf内边距，尺寸为实际的mm值，[上，右，下，左]
  * @param {ExtraRenderFunction} renderPageHeader 自定义pdf页眉
  * @param {ExtraRenderFunction} renderPageFooter 自定义pdf页脚
  * @param {boolean} [firstElementAsHeader = true] 首元素是否当做页眉处理，true：分页时首元素始终绘制与最顶部
  * @param {boolean} [lastElementAsFooter = true] 末元素是否当做页脚处理，true：分页时末元素始终绘制于最底部
  * @param {boolean} [stickyTableHeader = true] 命中的table元素表头换页时是否显示在最上面 
*/
```

## NOTICE
* 生成pdf时，目标元素会新增class: DomToPdf.TransformingClassName, 可用于修正元素生成pdf的显示问题
> eg: 修复table元素border显示问题 
```less
.dom-to-pdf-layer {
    &.dom-to-pdf-transforming {
        table {
            tr {
                // row底部border显示不全
                transform: translateY(-0.5px);
                td, th {
                    // 中间cell的左右border有重合部分
                    &:not(:first-of-type,:last-of-type) {
                        border-left: none;
                        border-right: none;
                    }
                }
            }
        }
    }
}
```
>