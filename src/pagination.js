(function(factory){
	if(!this._x){
		this._x = {};
	}
	this._x.Pagination = factory();
})(function (){
	function Button(options){
		Event.call(this);
		this.domElement = null;
		this.value = options.value;
		this.text = options.text;
		this.on('button.updatevalue', this.updateValue.bind(this));
		this.on('button.updatestyle', this.updateStyle.bind(this));
	}
	Button.prototype = Object.create(Event.prototype);

	Button.prototype.init = function(){
		this.domElement = document.createElement('li');
		this.aElement = document.createElement('a');
		this.domElement.appendChild(this.aElement);

		this.aElement.innerText = this.text;
		// this.aElement.setAttribute('href', 'javascript:void(0)');
		this.aElement.addEventListener('click', function(){
			this.trigger('button.clicked', this.value);
		}.bind(this));
		return this;
	};
	Button.prototype.updateValue = function(data){
		// 更新按钮的显示文字和值
		this.value += data.delta;
		this.text += data.delta;
		this.aElement.innerText = this.text;
		this.updateStyle(data.activePage);
		this.trigger('button.valueupdated');
		return this;
	};
	Button.prototype.updateStyle = function(value){
		// 当前按钮未被点击则取消选中样式
		if(value == 'disable'){
			this.domElement.setAttribute('class', 'disabled');
		}else if(value == 'enable'){
			this.domElement.removeAttribute('class');
		}else if(value !== this.value){
			var attr = this.domElement.getAttribute('class');
			if(attr){
				attr = attr.replace(/^active$|^active|active$|\s+?active\s+?/g, ' ')
							.replace(/^\s+/, '')
							.replace(/\s+$/, '');
				if(attr){
					this.domElement.setAttribute('class', attr);
				}else{
					this.domElement.removeAttribute('class');
				}
			}
		}else{
			this.domElement.setAttribute('class', 'active');
		}
		this.trigger('button.styleupdated');
		return this;
	};
	Button.prototype.destroy = function(){
		this.domElement.removeChild(this.aElement);
		this.trigger('button.destroy');
		this.value = null;
		this.text = null;
		this.events = null;
	};

	function Event(){
		this.events = {};
	}
	Event.prototype.on = function(name, cb){
		if(!this.events[name]){
			this.events[name] = [];
		}
		this.events[name].push(cb);
	};
	Event.prototype.trigger = function(name, params){
		if(this.events[name]){
			for(var i = 0; i < this.events[name].length; i++){
				this.events[name][i](params);
			}
		}
	};
	Event.prototype.unbind = function(name, cb){
		if(this.events[name] && this.events[name].length > 0){
			for(var i = this.events[name].length - 1; i > -1; i--){
				if(this.events[name][i] === cb){
					this.events[name].splice(i, 1);
				}
			}
		}
	};


	function Pagination(options){
		this.pageSize = options.pageSize || 0;
		this.totalNum = options.totalNum || 0;
		this.container = options.container;
		this.btnNum = this.btnEndNum = options.btnNum || 5;
		this.preText = options.preText || 'pre';
		this.nextText = options.nextText || 'next';
		
		this.btnStartNum = this.pageNum = 1;
		this.domElement = null;
		this.totalPage = Math.ceil(this.totalNum / this.pageSize);
		this.btns = [];
	}
	Pagination.prototype = Object.create(new Event());

	Pagination.prototype.init = function(){
		if(this.totalPage > 0){
			var btnNum;
			if(this.totalPage > this.btnNum){
				btnNum = this.btnNum;
			}else{
				btnNum = this.totalPage;
			}
			var frag = document.createDocumentFragment();
			this.domElement = document.createElement('ul');
			this.domElement.setAttribute('class', 'x-pagination');
			// 上一页按钮
			var preBtn = new Button({text: this.preText, value: 'pre'}).init();
			this.btns.push(preBtn);
			this.domElement.appendChild(preBtn.domElement);
			preBtn.on('button.clicked', this.select.bind(this));

			for(var i = 1; i <= btnNum; i++){
				var btn = new Button({value: i, text: i}).init();
				btn.on('button.clicked', this.select.bind(this));
				this.domElement.appendChild(btn.domElement);
				if(i === 1){
					btn.domElement.setAttribute('class', 'active');
				}
				this.btns.push(btn);
			}
			// 下一页按钮
			var nextBtn = new Button({text: this.nextText, value: 'next'}).init();
			this.btns.push(nextBtn);
			this.domElement.appendChild(nextBtn.domElement);
			nextBtn.on('button.clicked', this.select.bind(this));
			
			frag.appendChild(this.domElement);
			this.container.appendChild(frag);
		}
		this.trigger("pagination.init");
		return this;
	};
	Pagination.prototype.select = function(pageNum){
		var preBtn = this.btns[0], nextBtn = this.btns[this.btns.length - 1];
		// 计算当前页
		if(pageNum === 'pre'){
			this.pageNum--;
			if(this.pageNum < 1){
				this.pageNum = 1;
			}
		}else if(pageNum === 'next'){
			this.pageNum++;
			if(this.pageNum > this.totalPage){
				this.pageNum = this.totalPage;
			}
		}else{
			if(pageNum < 1){
				this.pageNum = 1;
			}else if(pageNum > this.totalPage){
				this.pageNum = this.totalPage;
			}else{
				this.pageNum = pageNum;
			}
		}
		if(this.pageNum == this.totalPage){
			if(this.pageNum == 1){
				preBtn.trigger('button.updatestyle', 'disable');
				nextBtn.trigger('button.updatestyle', 'disable');
			}else{
				preBtn.trigger('button.updatestyle', 'enable');
				nextBtn.trigger('button.updatestyle', 'disable');	
			}
		}else if(this.pageNum == 1){
			nextBtn.trigger('button.updatestyle', 'enable');
			preBtn.trigger('button.updatestyle', 'disable');
		}else{
			preBtn.trigger('button.updatestyle', 'enable');
			nextBtn.trigger('button.updatestyle', 'enable');
			
		}
		for(var i = 0; i < this.btns.length; i++){
			this.btns[i].trigger('button.updatestyle', this.pageNum);
		}
		this.updateButtonRange();
		this.trigger("pagination.select", this.pageNum);
		return this;
	};
	Pagination.prototype.updateButton = function(delta){
		this.btnStartNum += delta;
		this.btnEndNum += delta;
		for(var i = 1; i < this.btns.length - 1; i++){
			this.btns[i].trigger('button.updatevalue', {delta: delta, activePage: this.pageNum});
		}
	};
	Pagination.prototype.updateButtonRange = function(){
		var delta = this.pageNum - Math.floor((this.btnStartNum + this.btnEndNum) / 2);
		if(delta < 0 && this.btnStartNum !== 1){
			if(delta + this.btnStartNum < 1){
				delta = 1 - this.btnStartNum;
			}
			this.updateButton(delta);
		}else if(delta > 0 && this.btnEndNum !== this.totalPage){
			if(delta + this.btnEndNum > this.totalPage){
				delta = this.totalPage - this.btnEndNum;
			}
			this.updateButton(delta);
		}
	};
	Pagination.prototype.destroy = function(){
		for(var i = 0; i < this.btns.length; i++){
			this.btns[i].destroy();
			this.domElement.removeChild(this.btns[i].domElement);
			this.btns[i].domElement = null;
		}
		this.container.removeChild(this.domElement);
		this.trigger("pagination.destroy");
		this.domElement = null;
		this.events = null;
		this.btns = null;
		this.container = null;
	};
	return Pagination;
});