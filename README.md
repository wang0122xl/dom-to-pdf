<!--
 * @Date: 2022-03-16 15:14:33
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2022-03-16 18:05:19
 * @Description: file content
-->
# dom-to-pdf
## TODO
* 多元素转PDF
* pdf-table 判断回调方法实现
* pdf-table 换页场景表头是否复用逻辑
* 额外页眉页脚使用html dom实现

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