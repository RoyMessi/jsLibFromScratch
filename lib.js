(function(w){
	var Element = (function(){
		var cur_element;
		return {
			notExist:function(element){
				throw element+' Not exists';
			},
			convertToDom:function(element){
				if(element===document){
					cur_element = document;
					return cur_element;
				}else if(typeof(element)!=='string'){// TODO: find better way to determent is it a node element
					cur_element = element;
					return cur_element;
				}
				
				let length = document.querySelectorAll(element).length;
				if(length==0){
					cur_element = undefined;
					this.notExist(element);
				}
				else if(length==1){
					cur_element = document.querySelector(element);
				}else{
					cur_element = document.querySelectorAll(element);
				}
				return cur_element;
			},
			Animation:(function(){
				var time_in;
				var time_out;
				var speeds = {slow:800,normal:500,fast:400};
				function getDuration(d){
					if(typeof(d)!='string' && typeof(d)!='number')
						return false;
					if(typeof(d)=='string'){
						if(typeof(speeds[d])==='number') d = speeds[d];
						else d = speeds.fast;
					}
					return d/10;
				}
				return {
					fadeIn:function(params){
						var duration=getDuration(params[0]);
						var o=0;
						if(duration===false) return this;
						time_in = setInterval(function(){
							if(o>=0.8){
								if(typeof(params[1])==='function') params[1].call(params[1]);
								clearInterval(time_in);
								o=1;
							}else{
								o+=0.1;
							}
							cur_element.style.opacity = o;
						},duration);
						
						return this;
					},
					fadeOut:function(params){
						var duration=getDuration(params[0]);
						var o=1;
						if(duration===false) return this;
						time_out = setInterval(function(){
							if(o<=0.2){
								if(typeof(params[1])==='function') params[1].call(params[1]);
								clearInterval(time_out);
								o=0;
							}else{
								o-=0.1;
							}
							cur_element.style.opacity = o;
						},duration);
						
						return this;
					}
				}
			})(),
			Dom:(function(){
				return {
					html:function(content){
						cur_element.innerHTML = content;
						return this;
					},
					text:function(content){
						cur_element.innerText = content;
						return this;
					}
				}
			})(),
			Css:(function(){
				return {
					add:function(params){
						for(var name in params){
							cur_element.style[name] = params[name];
						}
						return this;
					},
					remove:function(params){
						for(var name in params){
							cur_element.style[params[name]] = null;
						}
						return this;
					}
				}
			})(),
			Events:(function(){
				let events = {};
				return {
					on:function(params){
						if(params.length>3 && params.length<2) return this;
						let element,callback;
						if(params.length==2){
							element = cur_element;
							callback = params[1];
						}else{
							element = document.querySelector(params[1]);
							callback = params[2];
						}
						
						if(typeof(callback)!=='function') return this;
						
						function func(e){
							events[e.target] = {event:params[0],callback:func};
							callback.call(callback,e);
						};						
						element.addEventListener(params[0],func,false);
						return this;
					},
					off:function(params){
						try{
							cur_element.removeEventListener(events[cur_element].event,events[cur_element].callback);
							delete events[cur_element];
						}catch(e){
							console.error(e);
						}
						return this;
					}
				}
			})(),
			Attrs:(function(){
				function prepareAttrs(attrs,add){
					for(var name in attrs){
						if(add) cur_element.setAttribute(name,attrs[name]);
						else cur_element.removeAttribute(attrs[name]);
					}
				}
				
				return {
					add:function(attrs){
						prepareAttrs(attrs,1);
						return this;
					},
					remove:function(attrs){
						prepareAttrs(attrs,0);
						return this;
					},
					toggle:function(attrs){
						for(var name in attrs){
							if(cur_element.hasAttribute(name)) cur_element.removeAttribute(name);
							else cur_element.setAttribute(name,attrs[name]);
						}
					}
				}
			})(),
			Classes:(function(){
				
				function isClassNameValid(class_name){
					if(typeof(class_name)!='object' && class_name!=null && class_name!=undefined)
						return false;
					else return true;
				}
				
				function prepareClassName(class_name,func_name){
					for(var i in class_name){
						if(typeof(class_name[i])!='string') prepareClassName(class_name[i],func_name);
						else cur_element.classList[func_name](class_name[i]);
					}
				}
				
				return {
					add:function(class_name){
						return prepareClassName(class_name,'add');
						return this;
					},
					remove:function(class_name){
						return prepareClassName(class_name,'remove');
						this;
					},
					toggle:function(class_name){
						prepareClassName(class_name,'toggle');
						return this;
					}
				}
			})()
		}
	})();
	
	function lib(element){
		if(typeof(element)==='function'){
			window.addEventListener('load',function(e){
				element.call(element,e);
			},false);
		}else{
			element = Element.convertToDom(element);
		}
		
		return {
			fadeIn:function(...params){
				return Element.Animation.fadeIn.call(this,params);
			},
			fadeOut:function(...params){
				return Element.Animation.fadeOut.call(this,params);
			},
			on:function(...params){
				return Element.Events.on.call(this,params);
			},
			off:function(params){
				return Element.Events.off.call(this,params);
			},
			html:function(content){
				return Element.Dom.html.call(this,content);
			},
			text:function(content){
				return Element.Dom.text.call(this,content);
			},
			css:function(params){
				return Element.Css.add.call(this,params);
			},
			removeCss:function(...params){
				return Element.Css.remove.call(this,params);
			},
			addAttr:function(attrs){
				return Element.Attrs.add.call(this,attrs);
			},
			removeAttr:function(...attrs){
				return Element.Attrs.remove.call(this,attrs);
			},
			toggleAttr:function(attrs){
				return Element.Attrs.toggle.call(this,attrs);
			},
			addClass:function(...class_name){
				return Element.Classes.add.call(this,class_name);
			},
			removeClass:function(...class_name){
				return Element.Classes.remove.call(this,class_name);
			},
			toggleClass:function(...class_name){
				return Element.Classes.toggle.call(this,class_name);
			}

		}
	}
	
	w.$ = lib;
})(window);
