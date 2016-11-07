#简介
该插件不依赖任何JS库，主要用于显示日历及日期上所需要显示的信息。

#使用
###初始化
######HTML
	<div id="calendar"></div>
	
######JavaScript
	var calendar = new Calendar();
	
###配置参数
| 名称 | 类型 | 默认值 | 描述 |
| :-----:|:-----:|:-----:|:-----:|
|  el | String | '#calendar' | 指定标识符，支持类名，id名，自定义属性名；暂不支持层级选择|
| year | Number | 当前年份 | 初始化年份，之后缓存日历当前显示的年份 |
| month | Number | 当前月份 | 初始化月份，之后缓存日历当前显示的月份 | 
| datePosition | String | 'leftTop' | 日期数字显示的位置，支持的值：leftTop, leftBottom, rightTop, rightBottom |
| leftTopHTML | String | - | 每个日期框左上角可显示的内容，支持HTML字符串 |
| leftBottomHTML | String | - | 每个日期框左下角可显示的内容，支持HTML字符串 |
| rightTopHTML | String | - | 每个日期框右上角可显示的内容，支持HTML字符串 |
| rightBottomHTML | String | - | 每个日期框右下角可显示的内容，支持HTML字符串 |
| iconPrev | String | '<' | 上个月按钮的图标，可以是图片，字体图标等格式 |
| iconNext | String | '>' | 下个月按钮的图标，可以是图片，字体图标等格式 |
| displayInfoOnDisabled | Boolean | false | 是否在不可用的日期上显示信息 |
| thisMonthDateStyle | String | - | 当前月份日期框样式 |
| lastMonthDateStyle | String | - | 上个月日期框样式 |
| nextMonthDateStyle | String | - | 下个月日期框样式 |
| weekStart | Number | 0 | 插件从星期几开始显示，默认是星期一 |
| showLastMonth | String | 'yes' | 是否显示上个月 |
| showNextMonth | String | 'yes' | 是否显示下个月 |
| notAvailable | Object | {prev: [], current: [], next: []} | 不可用的日期 |
| allowHoverOnDisabled | Function | - | 当鼠标指向不可用的日期时，是否调用回调函数 |
| allowClickOnDisabled | Function | - | 当鼠标点击不可用的日期时，是否调用回调函数 |

###事件回调
| 名称 | 类型 | 默认值 | 描述 |
| :-----:|:-----:|:-----:|:-----:|
| preRenderCallback | Function | - | 渲染之前的回调函数 |
| postRenderCallback | Function | - | 渲染之后的回调函数 |
| hoverCallback | Function | - | 鼠标指向日期时的回调函数 |
| outCallback | Function | - | 鼠标离开日期时的回调函数 |
| clickCallback | Function | - | 鼠标点击日期时的回调函数 |


###常用方法
| 名称 | 描述 | 使用 |
| :-----:|:-----:|:-----:|
| init | 初始化实例之后手动调用，渲染插件 | obj.init(); |
| updateContent | 更新内容，包括leftTopHTML，leftBottomHTML，rightTopHTML，rightBottomHTML和notAvailable的内容 | obj.updateContent({<br>leftTopHTML: '', <br>leftBottomHTML: '', <br>rightTopHTML: '', <br>rightBottomHTML: '', <br>notAvailable: {}});
| render | 手动渲染插件 | obj.render(); |
| prev | 上个月 | obj.prev(); |
| next | 下个月 | obj.next(); |

###更新日志
v0.0.1 月份切换，鼠标hover，click回调函数，日期框中信息的内容，样式设置。