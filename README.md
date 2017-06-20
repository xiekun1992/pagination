# pagination
一个分页插件

#### options:
- container: 分页插件的父级元素
- pageSize: 每页展示的数据条数
- pageTotal: 共有多少条数据
- btnNum: 分页按钮数量，不包括上下翻页按钮

#### events:
- pagination.init: 分页插件初始化之后触发
- pagination.select: 点击分页按钮之后触发
- pagination.destroy: 分页插件被销毁之后触发

``` javascript
var pagination = document.querySelector("#pagination");
var p = new _x.Pagination({
    container: pagination,
    pageSize: 1,
    pageTotal: 10,
    btnNum: 5
});
p.on('pagination.init', function(){
    console.log('init');
});
p.on('pagination.select', function(page){
    console.log(page);
});
p.on('pagination.destroy', function(){
    console.log('destroyed');
});
p.init();
