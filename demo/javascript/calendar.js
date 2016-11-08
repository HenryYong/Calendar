/*	Created @ 2016/11/6 By HenryYang
 **	Calendar.js, v0.0.1, MIT
 */

(function(window){
	//日期工具类
	//Class Date Utilities
	function DateUtil(){

	}

	//获取某个月的天数
	//To get total number of days of certain month
	DateUtil.prototype.getDaysOfMonth = function(year, month){
		var days = 0;

		switch (Number(month)){
			case 1:
			case 3:
			case 5:
			case 7:
			case 8:
			case 10:
			case 12:
				days = 31;
				break;
			case 4:
			case 6:
			case 9:
			case 11:
				days = 30;
				break;
			case 2:
				if((year % 4 == 0) || (year % 400 == 0) && (year % 100 != 0)){
					days = 29;
				}
				else{
					days = 28;
				}
				break;
		}

		return days;
	};

	//获取某个月的第一天是星期几
	//To get the day of first day of certain month
	DateUtil.prototype.getFirstDay = function(year, month){
		var firstDay = -1,
			tempDate = new Date(year, month - 1, 1);
		
		firstDay = tempDate.getDay();

		if(firstDay == 0){
			firstDay = 6;
		}
		else{
			firstDay -= 1;
		}

		return firstDay;
	};

	//判断某个数字是否在给定的数组中
	//Verify a number whether it is in an array
	DateUtil.prototype.isInArray = function(item, arr){
		try{
			;[].forEach.call(arr, function(cur, index, array){
				if(item == cur){
					throw false;
				}
			});
		}
		catch(e){
			return true;
		}

		return false;
	};

	function Calendar(options){
		var that = this,
			opts = options || {},
			thisDate = new Date();

		//样式相关参数	
		//arguments related to style of calendar
		this.el = opts.el || '#calendar';
		this.year = opts.year || thisDate.getFullYear();
		this.month = opts.month || (thisDate.getMonth() + 1);
		this.datePosition = opts.datePosition || 'leftTop';
		this.leftTopHTML = opts.leftTopHTML || '';
		this.leftBottomHTML = opts.leftBottomHTML || '';
		this.rightTopHTML = opts.rightTopHTML || '';
		this.rightBottomHTML = opts.rightBottomHTML || '';
		this.iconPrev = opts.iconPrev || '<';
		this.iconNext = opts.iconNext || '>';
		this.displayInfoOnDisabled = opts.displayInfoOnDisabled || false;
		this.thisMonthDateStyle = opts.thisMonthDateStyle || '';
		this.lastMonthDateStyle = opts.lastMonthDateStyle || '';
		this.nextMonthDateStyle = opts.nextMonthDateStyle || '';

		//内容相关参数
		//arguments related to content of calendar
		this.weekStart = opts.weekStart || 0;	//0~6 -> 星期一~星期日/Monday to Sunday
		this.showLastMonth = opts.showLastMonth || 'yes';
		this.showNextMonth = opts.showNextMonth || 'yes';

		//函数相关参数
		//arguments related to function
		this.preRenderCallback = opts.preRenderCallback || function(){};
		this.postRenderCallback = opts.postRenderCallback || function(){};
		this.hoverCallback = opts.hoverCallback || function(){};
		this.outCallback = opts.outCallback || function(){};
		this.clickCallback = opts.clickCallback || function(){};
		this.allowHoverOnDisabled = opts.allowHoverOnDisabled || false;
		this.allowClickOnDisabled = opts.allowClickOnDisabled || false;

		//数据相关参数
		//arguments related to info of each date block
		this.data = opts.data || {prev: {}, current: {}, next: {}};
		this.notAvailable = opts.notAvailable || {prev: [], current: [], next: []};

		var parent = document.querySelector(this.el);
		var tools = {};

		var getDaysOfMonth = this.getDaysOfMonth.bind(this),
			preRenderCallback = this.preRenderCallback.bind(this),
			postRenderCallback = this.postRenderCallback.bind(this),
			hoverCallback = this.hoverCallback.bind(this),
			outCallback = this.outCallback.bind(this),
			clickCallback = this.clickCallback.bind(this);

		//设置语言
		//language setting
		if(!opts.language || opts.language == 'zh'){
			this.language = {
				year: '年',
				month: '月',
				week: ['星期一','星期二','星期三','星期四','星期五','星期六','星期日']
			}
		}
		else{
			this.language = {
				year: 'year',
				month: 'month',
				week: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
			}
		}

		//拼接tools部分DOM字符串
		//joint DOM string of tools
		this._getToolsDOM = function(){
			var toolsDOM = '<div class="calendar-tool">'+
								'<button type="button" id="calendarPrev" class="calendar-prev" data-type="calendar-btn">'+this.iconPrev+'</button>'+
								'<span class="calendar-year-month">'+
									'<span class="calendar-year" id="calendarYear" data-value=""></span>'+
									this.language.year+
									'<span class="calendar-month" id="calendarMonth" data-value=""></span>'+
									this.language.month+
								'</span>'+
								'<button type="button" id="calendarNext" class="calendar-next" data-type="calendar-btn">'+this.iconNext+'</button>'+
							'</div>';
			
			return toolsDOM;
		};

		//计算日历第一列的星期数的值和当前月第一天星期数的值的差
		//calculate differential of day of week between the first column and the day of the first day of current month
		this._countGapDays = function(weekStart, firstDay){
			if(weekStart == firstDay){
				return 0;
			}
			else if(weekStart > firstDay){
				return 7 - weekStart + firstDay;
			}
			else if(weekStart < firstDay){
				return firstDay - weekStart;
			}
		};

		//拼接日历内容DOM字符串
		//joint DOM string of calendar content
		this._getCalendarDOM = function(year, month, daysOfMonth, firstDay){
			var calendarBody = '',
				isLastMonth = '',
				isNextMonth = '',
				availableClass = '',
				notAvailable = false,
				nextMonth = 1,
				thisMonth = 1,
				weekStart = this.weekStart;

			var lastYear = year,
				lastMonth = month;

			if(month == 1){
				lastMonth = 12;
				lastYear = year - 1;
			}
			else{
				lastMonth = month - 1;
			}

			//获取上月天数，确定当前月份面板中第一天
			//get the number of days of last month, and calculate the very first day of calendar
			var	daysOfLastMonth = getDaysOfMonth(lastYear, lastMonth),
				daysOfThisMonth = getDaysOfMonth(year, month),
				thisPanelFirstDay = daysOfLastMonth - this._countGapDays(weekStart, firstDay) + 1;

			var dateContentDOM = '',
				datePosition = this.datePosition;

			switch (datePosition){
				case 'leftTop':
					dateContentDOM += '<div class="calendar-date-leftBottom">'+
											this.leftBottomHTML+
										'</div>'+
										'<div class="calendar-date-rightTop">'+
											this.rightTopHTML+
										'</div>'+
										'<div class="calendar-date-rightBottom">'+
											this.rightBottomHTML+
										'</div>';
					break;
				case 'leftBottom':
					dateContentDOM += '<div class="calendar-date-leftTop">'+
											this.leftTopHTML+
										'</div>'+
										'<div class="calendar-date-rightTop">'+
											this.rightTopHTML+
										'</div>'+
										'<div class="calendar-date-rightBottom">'+
											this.rightBottomHTML+
										'</div>';
					break;
				case 'rightTop':
					dateContentDOM += '<div class="calendar-date-leftTop">'+
											this.leftTopHTML+
										'</div>'+
										'<div class="calendar-date-leftBottom">'+
											this.leftBottomHTML+
										'</div>'+
										'<div class="calendar-date-rightBottom">'+
											this.rightBottomHTML+
										'</div>';
					break;
				case 'rightBottom':
					dateContentDOM += '<div class="calendar-date-leftTop">'+
											this.leftTopHTML+
										'</div>'+
										'<div class="calendar-date-leftBottom">'+
											this.leftBottomHTML+
										'</div>'+
										'<div class="calendar-date-rightTop">'+
											this.rightTopHTML+
										'</div>';	
					break;
			}

			//拼接日历内容
			//joint DOM string of calendar content
			//拼接日历内容第一行
			//joint DOM string of the first row of calendar
			calendarBody += '<div class="calendar-date-row">';
			for(var i = 0; i < 7; i++){
				if(weekStart != firstDay){//若内容第一个星期数不是当月一号的星期数/if the first day of week is not equal to the day of week of the first day of month
					if(thisPanelFirstDay <= daysOfLastMonth){	//上个月/last month
						var lastMonthHTML = '';
						notAvailable = this.isInArray(thisPanelFirstDay, this.notAvailable.prev);
						isLastMonth = ' calendar-last-month';
						
						if(this.showLastMonth && this.showLastMonth == 'yes'){
							lastMonthHTML += '<div class="calendar-date' + ' ' + this.datePosition + ' ' + this.lastMonthDateStyle + '" data-type="date">' + thisPanelFirstDay + '</div>'+
												(notAvailable && !this.displayInfoOnDisabled ? '' : dateContentDOM );
							availableClass = notAvailable ? 'not-available' : '';
						}

						calendarBody += '<div class="calendar-date-item ' + availableClass + isLastMonth + '" data-type="calendar-item">'+
												lastMonthHTML+
											'</div>';
						thisPanelFirstDay++;
					}
					else{		//当前月/current month
						notAvailable = this.isInArray(thisMonth, this.notAvailable.current);
						availableClass = notAvailable ? 'not-available' : '';
						calendarBody += '<div class="calendar-date-item' + ' ' + availableClass + '" data-type="calendar-item">'+
											'<div class="calendar-date ' + this.datePosition + ' ' + this.thisMonthDateStyle + '" data-type="date">' + thisMonth + '</div>'+
											(notAvailable && !this.displayInfoOnDisabled ? '' : dateContentDOM )+
										'</div>';
						thisMonth++;
					}
				}
				else{
					notAvailable = this.isInArray(thisMonth, this.notAvailable.current);
					availableClass = notAvailable ? 'not-available' : '';
					calendarBody += '<div class="calendar-date-item' + ' ' + availableClass + '" data-type="calendar-item">'+
										'<div class="calendar-date ' + this.datePosition +  ' ' + this.thisMonthDateStyle + '" data-type="date">' + thisMonth + '</div>'+
										(notAvailable && !this.displayInfoOnDisabled ? '' : dateContentDOM) +
									'</div>';
					thisMonth++;
				}
			}
			calendarBody += '</div>';

			//拼接日历内容当月内容
			//joint DOM string of current month(days can fill in all 7 days)
			var countWeek = true;
			while(countWeek && thisMonth < daysOfThisMonth){
				calendarBody += '<div class="calendar-date-row">';
				for(var i = 0; i < 7; i++){
					notAvailable = this.isInArray(thisMonth, this.notAvailable.current);
					availableClass = notAvailable ? 'not-available' : '';
					calendarBody += '<div class="calendar-date-item' + ' ' + availableClass + '" data-type="calendar-item">'+
										'<div class="calendar-date ' + this.datePosition + ' ' + this.thisMonthDateStyle + '" data-type="date">' + thisMonth + '</div>'+
										(notAvailable && !this.displayInfoOnDisabled ? '' : dateContentDOM) +
									'</div>';
					thisMonth++;
				}
				calendarBody += '</div>';

				if(thisMonth + 6 > daysOfThisMonth){
					countWeek = false;
				}
			}

			//拼接日历内容最后一行(如果最后一行不够七天，需要显示下个月的内容)
			//joint last row of calendar
			if(thisMonth <= daysOfThisMonth){
				calendarBody += '<div class="calendar-date-row">';
				for(var i = 0; i < 7; i++){
					if(thisMonth - 1 < daysOfThisMonth){	//最后一行当前月的内容
						notAvailable = this.isInArray(thisMonth, this.notAvailable.current);
						availableClass = notAvailable ? 'not-available' : '';
						calendarBody += '<div class="calendar-date-item' + ' ' + availableClass + '" data-type="calendar-item">'+
											'<div class="calendar-date' + ' ' + this.datePosition + ' ' + this.thisMonthDateStyle + '" data-type="date">' + thisMonth + '</div>'+
											(notAvailable && !this.displayInfoOnDisabled ? '' : dateContentDOM) +
										'</div>';
						thisMonth++;
					}
					else{				//最后一行下个月的内容
						var nextMonthHTML = '';

						notAvailable = this.isInArray(nextMonth, this.notAvailable.current);
						isNextMonth = 'calendar-next-month';

						if(this.showNextMonth && this.showNextMonth == 'yes'){
							nextMonthHTML += '<div class="calendar-date' + ' ' + this.datePosition+ ' ' + this.nextMonthDateStyle + '" data-type="date">' + nextMonth + '</div>'+
											(notAvailable && !this.displayInfoOnDisabled ? '' : dateContentDOM);
							availableClass = notAvailable ? 'not-available' : '';	
						}
						
						calendarBody += '<div class="calendar-date-item' + ' ' + availableClass + ' ' + isNextMonth + '" data-type="calendar-item">'+
											nextMonthHTML+
										'</div>';
						nextMonth++;
					}
				}
				calendarBody += '</div>';
			}
			
			//拼接星期部分
			//joint DOM string of day of week
			var calendarHeader = '',
				lang = this.language;

			for(var i = weekStart; i < weekStart + 7; i++){
				var j;

				i < 7 ? j = i : j = i - 7;
				calendarHeader += '<div class="calendar-header-item">'+ lang.week[j] + '</div>';
			}

			return '<div class="calendar-content">'+
						'<div class="calendar-header">'+calendarHeader+'</div>'+
						'<div class="calendar-body">'+calendarBody+'</div>'+
					'</div>';
		};

		//设置or更新tools内容
		//set or update content of tools
		this._setTools = function(year, month){
			var yearDOM = parent.querySelector('#calendarYear'),
				monthDOM = parent.querySelector('#calendarMonth');

			yearDOM.setAttribute('data-value', year);
			yearDOM.innerText = year;
			monthDOM.setAttribute('data-value', month);
			monthDOM.innerText = month;

			if(!tools.prev){
				tools = {
					prev: document.querySelector('#calendarPrev'),
					next: document.querySelector('#calendarNext'),
					year: yearDOM.getAttribute('data-value'),
					month: monthDOM.getAttribute('data-value')
				}
			}
			else{
				tools.year = yearDOM.getAttribute('data-value');
				tools.month = monthDOM.getAttribute('data-value');
			}
		};

		//渲染数据
		this._renderData = function(){
			var data = this.data;
			var lt = parent.querySelectorAll('[data-value="leftTop"]'),
				lb = parent.querySelectorAll('[data-value="leftBottom"]'),
				rt = parent.querySelectorAll('[data-value="rightTop"]'),
				rb = parent.querySelectorAll('[data-value="rightBottom"]'),
				ltData = data.prev.leftTop,
				lbData = data.prev.leftBottom,
				rtData = data.prev.rightTop,
				rbData = data.prev.rightBottom;

			function findData(item, position){
				var parents = item.parentNode.parentNode,
					className = parents.classList.toString(),
					pos = Number(parents.querySelector('[data-type="date"]').innerHTML);

				var $value;
				if(className.indexOf('calendar-last-month') > -1){
					$value = data.prev[position][pos];
				}
				else if(className.indexOf('calendar-next-month') > -1){
					$value = data.next[position][pos];
				}
				else{
					$value = data.current[position][pos];
				}

				var $thisAllItems = item.parentNode.querySelectorAll('[data-value="'+position+'"]');

				;[].forEach.call($thisAllItems, function(cur, i, arr){
					if($value){
						if($value instanceof Array){
							cur.innerText = $value[i] == undefined ? '' : $value[i];
						}						
						else{
							cur.innerText = $value;
						}
					}					
				});
			}

			if(lt.length && ltData){
				;[].forEach.call(lt, function(cur, index, array){
					findData(cur, 'leftTop');
				});
			}

			if(lb.length && lbData){
				;[].forEach.call(lb, function(cur, index, array){
					findData(cur, 'leftBottom');
				});
			}

			if(rt.length && rtData){
				;[].forEach.call(rt, function(cur, index, array){
					findData(cur, 'rightTop');
				});
			}

			if(rb.length && rbData){
				;[].forEach.call(rb, function(cur, index, array){
					findData(cur, 'rightBottom');
				});
			}
		};

		//更新日历
		//update calendar
		this._updateCalender = function(year, month){
			this._setTools(year, month);

			var calendarDOM = this._getCalendarDOM(year, month, this.getDaysOfMonth(year, month), this.getFirstDay(year, month));
			parent.querySelector('.calendar-content').outerHTML = calendarDOM;

			this._bindEvents().itemEventsBind();
		};

		//渲染插件
		//render calendar
		this._render = function(year, month){
			var y = year || this.year,
				m = month || this.month,
				calendarDOM = this._getCalendarDOM(y, m, this.getDaysOfMonth(y, m), this.getFirstDay(y, m));

			preRenderCallback();

			if(!parent.childNodes.length){			//初始化/init
				var toolsDOM = this._getToolsDOM();
				parent.innerHTML = toolsDOM + calendarDOM;
				this._setTools(y, m);
			}	
			else{			//更新/update
				this._updateCalender(y, m);
			}	

			this._renderData();
			postRenderCallback();
		};

		var _render = this._render.bind(this);

		//绑定事件
		//events binding
		this._bindEvents = function(){
			var prev = tools.prev,
				next = tools.next;

			return {
				onceEventsBind: function(){
					;[].forEach.call(parent.querySelectorAll('[data-type="calendar-btn"]'), function(cur, index, array){
						cur.addEventListener('click', function(){
							preRenderCallback();

							var _this = this,
								curYear = tools.year,
								curMonth = tools.month,
								id = _this.getAttribute('id');

							if(id == 'calendarPrev'){
								if(curMonth == 1){
									curMonth = 12;
									curYear--;
								}
								else{
									curMonth--;
								}
							}
							else if(id == 'calendarNext'){
								if(curMonth == 12){
									curMonth = 1;
									curYear++;
								}
								else{
									curMonth++;
								}
							}

							that.year = curYear;
							that.month = curMonth;

							_render(curYear, curMonth);
							postRenderCallback();
						}, false);
						
					});
				},
				itemEventsBind: function(){
					function bindHover(item){
						item.addEventListener('mouseenter', function(){
							hoverCallback.call(item);
						});
						item.addEventListener('mouseleave', function(){
							outCallback.call(item);
						});
					}

					function bindClick(item){
						item.addEventListener('click', function(){
							clickCallback.call(item);
						});
					}

					;[].forEach.call(parent.querySelectorAll('[data-type="calendar-item"]'), function(cur, index, array){
						if(cur.className.indexOf('not-available') > -1){
							if(that.allowHoverOnDisabled){
								(function(_this){
									bindHover(_this);
								})(cur);
							}

							if(that.allowClickOnDisabled){
								(function(_this){
									bindClick(_this);
								})(cur);
							}
						}
						else{
							(function(_this){
								bindHover(_this);
								bindClick(_this);
							})(cur);
						}
					});
				}
			}
		};

		//触发事件
		//events trigger
		this._trigger = function(element, event){
			if(document.createEventObject){
				var evt = document.createEventObject();
				return element.fireEvent('on' + event, evt);
			}
			else{
				var evt = document.createEvent('HTMLEvents');
				evt.initEvent(event, true, true);
				return !element.dispatchEvent(evt);
			}
		};
	}

	Calendar.prototype = new DateUtil();
	Calendar.prototype.constructor = Calendar;

	Calendar.prototype.init = function(){
		this._render();
		
		var bindingEvents = this._bindEvents();
		bindingEvents.onceEventsBind();
		bindingEvents.itemEventsBind();
	};

	Calendar.prototype.updateContent = function(options){
		var opts = options || {};
		
		opts.leftTopHTML ? this.leftTopHTML = opts.leftTopHTML : this.leftTopHTML = '';
		opts.leftBottomHTML ? this.leftBottomHTML = opts.leftBottomHTML : this.leftBottomHTML = '';
		opts.rightTopHTML ? this.rightTopHTML = opts.rightTopHTML : this.rightTopHTML = '';
		opts.rightBottomHTML ? this.rightBottomHTML = opts.rightBottomHTML : this.rightBottomHTML = '';

		//更新不可用数据，如果没传，则全部可用
		var na = opts.notAvailable,
			_this_na = this.notAvailable;
		if(na){
			for(var key in na){
				var _this = na[key];
				_this_na[key] = _this ? _this : [];
			}
		}
		else{
			_this_na = {prev: [], current: [], next: []};
		}
		return this;
	};

	Calendar.prototype.render = function(y, m){
		this._render(y, m);
		return this;
	};

	Calendar.prototype.prev = function(y, m){
		this._trigger(document.querySelector('#calendarPrev'), 'click');
		return this;
	};

	Calendar.prototype.next = function(y, m){
		this._trigger(document.querySelector('#calendarNext'), 'click');
		return this;
	};

	window.Calendar = Calendar;
})(window);
