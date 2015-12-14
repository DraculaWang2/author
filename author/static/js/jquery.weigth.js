/*! 
 * jQuery UI Widget 1.8.15 
 * $Id: jquery.ui.widget.js,v 1.3 2011/12/06 07:19:29 licongping Exp $ 
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about) 
 * Dual licensed under the MIT or GPL Version 2 licenses. 
 * http://jquery.org/license 
 * 
 * http://docs.jquery.com/UI/Widget 
 */
(function( $, undefined ) {

// jQuery 1.4+  
    if ( $.cleanData ) {
        var _cleanData = $.cleanData;
        // 重写cleanData方法，调用后触发每个元素的remove事件
        $.cleanData = function( elems ) {
            for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
                $( elem ).triggerHandler( "remove" );
            }
            _cleanData( elems );
        };
    } else {
        var _remove = $.fn.remove;
        $.fn.remove = function( selector, keepData ) {
            return this.each(function() {
                if ( !keepData ) {
                    if ( !selector || $.filter( selector, [ this ] ).length ) {
                        $( "*", this ).add( [ this ] ).each(function() {
                            $( this ).triggerHandler( "remove" );
                        });
                    }
                }
                return _remove.call( $(this), selector, keepData );
            });
        };
    }

    $.widget = function( name, base, prototype ) {
        var namespace = name.split( "." )[ 0 ],
            fullName;
        name = name.split( "." )[ 1 ];
        fullName = namespace + "-" + name;
        // 例如参数name='om.tabs'，变成namespace='om',name='tabs',fullName='om-tabs'

        // base默认为Widget类，组件默认会继承base类的所有方法
        if ( !prototype ) {
            prototype = base;
            base = $.Widget;
        }

        // create selector for plugin
        $.expr[ ":" ][ fullName ] = function( elem ) {
            return !!$.data( elem, name );
        };

        // 创建命名空间$.om.tabs
        $[ namespace ] = $[ namespace ] || {};
        $[ namespace ][ name ] = function( options, element ) {
            // allow instantiation without initializing for simple inheritance
            if ( arguments.length ) {
                this._createWidget( options, element );
            }
        };

        // 初始化父类，一般调用了$.Widget
        var basePrototype = new base();
        // we need to make the options hash a property directly on the new instance
        // otherwise we'll modify the options hash on the prototype that we're
        // inheriting from
//  $.each( basePrototype, function( key, val ) {  
//      if ( $.isPlainObject(val) ) {  
//          basePrototype[ key ] = $.extend( {}, val );  
//      }  
//  });  
        basePrototype.options = $.extend( true, {}, basePrototype.options );
        // 给om.tabs继承父类的所有原型方法和参数
        $[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
            namespace: namespace,
            widgetName: name,
            // 组件的事件名前缀，调用_trigger的时候会默认给trigger的事件加上前缀
            // 例如_trigger('create')实际会触发'tabscreate'事件
            widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
            widgetBaseClass: fullName
        }, prototype );

        // 把tabs方法挂到jquery对象上，也就是$('#tab1').tabs();
        $.widget.bridge( name, $[ namespace ][ name ] );
    };

    $.widget.bridge = function( name, object ) {
        $.fn[ name ] = function( options ) {
            // 如果tabs方法第一个参数是string类型，则认为是调用组件的方法，否则调用options方法
            var isMethodCall = typeof options === "string",
                args = Array.prototype.slice.call( arguments, 1 ),
                returnValue = this;

            // allow multiple hashes to be passed on init
            options = !isMethodCall && args.length ?
                $.extend.apply( null, [ true, options ].concat(args) ) :
                options;

            // '_'开头的方法被认为是内部方法，不会被执行，如$('#tab1').tabs('_init')
            // prevent calls to internal methods
            if ( isMethodCall && options.charAt( 0 ) === "_" ) {
                return returnValue;
            }

            if ( isMethodCall ) {
                this.each(function() {
                    // 执行组件方法
                    var instance = $.data( this, name ),
                        methodValue = instance && $.isFunction( instance[options] ) ?
                            instance[ options ].apply( instance, args ) :
                            instance;
                    // TODO: add this back in 1.9 and use $.error() (see #5972)
//              if ( !instance ) {  
//                  throw "cannot call methods on " + name + " prior to initialization; " +  
//                      "attempted to call method '" + options + "'";  
//              }  
//              if ( !$.isFunction( instance[options] ) ) {  
//                  throw "no such method '" + options + "' for " + name + " widget instance";  
//              }  
//              var methodValue = instance[ options ].apply( instance, args );  
                    if ( methodValue !== instance && methodValue !== undefined ) {
                        returnValue = methodValue;
                        return false;
                    }
                });
            } else {
                // 调用组件的options方法
                this.each(function() {
                    var instance = $.data( this, name );
                    if ( instance ) {
                        // 设置options后再次调用_init方法，第一次调用是在_createWidget方法里面。这个方法需要开发者去实现。
                        // 主要是当改变组件中某些参数后可能需要对组件进行重画
                        instance.option( options || {} )._init();
                    } else {
                        // 没有实例的话，给元素绑定一个实例。注意这里的this是dom，object是模块类
                        $.data( this, name, new object( options, this ) );
                    }
                });
            }

            return returnValue;
        };
    };

    $.Widget = function( options, element ) {
        // allow instantiation without initializing for simple inheritance
        if ( arguments.length ) {//如果有参数，调用初始化函数
            this._createWidget( options, element );
        }
    };

    $.Widget.prototype = {
        widgetName: "widget",
        widgetEventPrefix: "",
        options: {
            disabled: false
        },
        _createWidget: function( options, element ) {
            // $.widget.bridge stores the plugin instance, but we do it anyway
            // so that it's stored even before the _create function runs
            $.data( element, this.widgetName, this );
            this.element = $( element );
            this.options = $.extend( true, {},
                this.options,
                this._getCreateOptions(),
                options );

            var self = this;
            this.element.bind( "remove." + this.widgetName, function() {
                self.destroy();
            });
            // 开发者实现
            this._create();
            // 如果绑定了初始化的回调函数，会在这里触发。注意绑定的事件名是需要加上前缀的，如$('#tab1').bind('tabscreate',function(){});
            this._trigger( "create" );
            // 开发者实现
            this._init();
        },
        _getCreateOptions: function() {
            return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
        },
        _create: function() {},
        _init: function() {},

        destroy: function() {
            this.element
                .unbind( "." + this.widgetName )
                .removeData( this.widgetName );
            this.widget()
                .unbind( "." + this.widgetName )
                .removeAttr( "aria-disabled" )
                .removeClass(
                this.widgetBaseClass + "-disabled " +
                "ui-state-disabled" );
        },

        widget: function() {
            return this.element;
        },

        option: function( key, value ) {
            var options = key;

            if ( arguments.length === 0 ) {
                // don't return a reference to the internal hash
                return $.extend( {}, this.options ); // 返回组件的options
            }

            if  (typeof key === "string" ) {
                if ( value === undefined ) {
                    return this.options[ key ]; // 获取值
                }
                options = {};
                options[ key ] = value;
            }

            this._setOptions( options ); // 设置值

            return this;
        },
        _setOptions: function( options ) {
            var self = this;
            $.each( options, function( key, value ) {
                self._setOption( key, value );
            });

            return this;
        },
        _setOption: function( key, value ) {
            this.options[ key ] = value;

            if ( key === "disabled" ) {
                this.widget()
                    [ value ? "addClass" : "removeClass"](
                    this.widgetBaseClass + "-disabled" + " " +
                    "ui-state-disabled" )
                    .attr( "aria-disabled", value );
            }

            return this;
        },

        enable: function() {
            return this._setOption( "disabled", false );
        },
        disable: function() {
            return this._setOption( "disabled", true );
        },

        // $.widget中优化过的trigger方法。可以同时调用config中的方法和bind的方法。
        // 即可以用两个方式去给组件绑定事件。如$("tabs").omTabs({"change":function(){//handler}});或者$("tabs").bind("tabschange",function(){//handler});
        _trigger: function( type, event, data ) {
            // 调用初始化配置config中的回调方法
            var callback = this.options[ type ];
            // 封装js标准event对象为jquery的Event对象
            event = $.Event( event );
            // 给事件名称加上前缀，前缀默认是组件的名字。如_trigger("change")实际会触发"tabschange"事件
            event.type = ( type === this.widgetEventPrefix ?
                type :
            this.widgetEventPrefix + type ).toLowerCase();
            data = data || {};
            // copy original event properties over to the new event
            // this would happen if we could call $.event.fix instead of $.Event
            // but we don't have a way to force an event to be fixed multiple times
            if ( event.originalEvent ) {
                for ( var i = $.event.props.length, prop; i; ) {
                    prop = $.event.props[ --i ];
                    event[ prop ] = event.originalEvent[ prop ];
                }
            }
            // 触发element中绑定的事件
            this.element.trigger( event, data );
            return !( $.isFunction(callback) &&
            callback.call( this.element[0], event, data ) === false ||
            event.isDefaultPrevented() );
        }
    };

})( jQuery );  