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
		this.aElement.setAttribute('href', 'javascript:void(0)');
		this.aElement.addEventListener('click', function(){
			this.trigger('button.clicked', this.value);
		}.bind(this));
		return this;
	};
	Button.prototype.updateValue = function(data){
		this.value += data.delta;
		this.text += data.delta;
		this.aElement.innerText = this.text;
		this.updateStyle(data.activePage);
		this.trigger('button.valueupdated');
		return this;
	};
	Button.prototype.updateStyle = function(value){
		// 当前按钮未被点击则取消选中样式
		if(value !== this.value){
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
		this.trigger('button.destroy');
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
		this.pageTotal = options.pageTotal || 0;
		this.btnStartNum = this.pageNum = 1;
		this.btnEndNum = this.btnNum = options.btnNum || 5;
		this.container = options.container;
		this.totalPage = Math.ceil(this.pageTotal / this.pageSize);
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
			var ul = document.createElement('ul');
			ul.setAttribute('class', 'x-pagination');
			// 上一页按钮
			var preBtn = new Button({text: 'pre', value: 'pre'}).init();
			this.btns.push(preBtn);
			ul.appendChild(preBtn.domElement);
			preBtn.on('button.clicked', this.select.bind(this));

			for(var i = 1; i <= btnNum; i++){
				var btn = new Button({value: i, text: i}).init();
				btn.on('button.clicked', this.select.bind(this));
				ul.appendChild(btn.domElement);
				if(i === 1){
					btn.domElement.setAttribute('class', 'active');
				}
				this.btns.push(btn);
			}
			// 下一页按钮
			var nextBtn = new Button({text: 'next', value: 'next'}).init();
			this.btns.push(nextBtn);
			ul.appendChild(nextBtn.domElement);
			nextBtn.on('button.clicked', this.select.bind(this));
			
			frag.appendChild(ul);
			this.container.appendChild(frag);
		}
		this.trigger("pagination.init");
		return this;
	};
	Pagination.prototype.select = function(pageNum){
		// 计算当前页
		if(pageNum === 'pre'){
			this.pageNum--;
			if(this.pageNum < 1){
				this.pageNum = 1;
			}
		}else if(pageNum === 'next'){
			this.pageNum++;
			if(this.pageNum > this.pageTotal){
				this.pageNum = this.pageTotal;
			}
		}else{
			this.pageNum = pageNum;
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
		this.trigger("pagination.destroy");
	};
	return Pagination;
});