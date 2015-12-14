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
        // ��дcleanData���������ú󴥷�ÿ��Ԫ�ص�remove�¼�
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
        // �������name='om.tabs'�����namespace='om',name='tabs',fullName='om-tabs'

        // baseĬ��ΪWidget�࣬���Ĭ�ϻ�̳�base������з���
        if ( !prototype ) {
            prototype = base;
            base = $.Widget;
        }

        // create selector for plugin
        $.expr[ ":" ][ fullName ] = function( elem ) {
            return !!$.data( elem, name );
        };

        // ���������ռ�$.om.tabs
        $[ namespace ] = $[ namespace ] || {};
        $[ namespace ][ name ] = function( options, element ) {
            // allow instantiation without initializing for simple inheritance
            if ( arguments.length ) {
                this._createWidget( options, element );
            }
        };

        // ��ʼ�����࣬һ�������$.Widget
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
        // ��om.tabs�̳и��������ԭ�ͷ����Ͳ���
        $[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
            namespace: namespace,
            widgetName: name,
            // ������¼���ǰ׺������_trigger��ʱ���Ĭ�ϸ�trigger���¼�����ǰ׺
            // ����_trigger('create')ʵ�ʻᴥ��'tabscreate'�¼�
            widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
            widgetBaseClass: fullName
        }, prototype );

        // ��tabs�����ҵ�jquery�����ϣ�Ҳ����$('#tab1').tabs();
        $.widget.bridge( name, $[ namespace ][ name ] );
    };

    $.widget.bridge = function( name, object ) {
        $.fn[ name ] = function( options ) {
            // ���tabs������һ��������string���ͣ�����Ϊ�ǵ�������ķ������������options����
            var isMethodCall = typeof options === "string",
                args = Array.prototype.slice.call( arguments, 1 ),
                returnValue = this;

            // allow multiple hashes to be passed on init
            options = !isMethodCall && args.length ?
                $.extend.apply( null, [ true, options ].concat(args) ) :
                options;

            // '_'��ͷ�ķ�������Ϊ���ڲ����������ᱻִ�У���$('#tab1').tabs('_init')
            // prevent calls to internal methods
            if ( isMethodCall && options.charAt( 0 ) === "_" ) {
                return returnValue;
            }

            if ( isMethodCall ) {
                this.each(function() {
                    // ִ���������
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
                // ���������options����
                this.each(function() {
                    var instance = $.data( this, name );
                    if ( instance ) {
                        // ����options���ٴε���_init��������һ�ε�������_createWidget�������档���������Ҫ������ȥʵ�֡�
                        // ��Ҫ�ǵ��ı������ĳЩ�����������Ҫ����������ػ�
                        instance.option( options || {} )._init();
                    } else {
                        // û��ʵ���Ļ�����Ԫ�ذ�һ��ʵ����ע�������this��dom��object��ģ����
                        $.data( this, name, new object( options, this ) );
                    }
                });
            }

            return returnValue;
        };
    };

    $.Widget = function( options, element ) {
        // allow instantiation without initializing for simple inheritance
        if ( arguments.length ) {//����в��������ó�ʼ������
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
            // ������ʵ��
            this._create();
            // ������˳�ʼ���Ļص��������������ﴥ����ע��󶨵��¼�������Ҫ����ǰ׺�ģ���$('#tab1').bind('tabscreate',function(){});
            this._trigger( "create" );
            // ������ʵ��
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
                return $.extend( {}, this.options ); // ���������options
            }

            if  (typeof key === "string" ) {
                if ( value === undefined ) {
                    return this.options[ key ]; // ��ȡֵ
                }
                options = {};
                options[ key ] = value;
            }

            this._setOptions( options ); // ����ֵ

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

        // $.widget���Ż�����trigger����������ͬʱ����config�еķ�����bind�ķ�����
        // ��������������ʽȥ��������¼�����$("tabs").omTabs({"change":function(){//handler}});����$("tabs").bind("tabschange",function(){//handler});
        _trigger: function( type, event, data ) {
            // ���ó�ʼ������config�еĻص�����
            var callback = this.options[ type ];
            // ��װjs��׼event����Ϊjquery��Event����
            event = $.Event( event );
            // ���¼����Ƽ���ǰ׺��ǰ׺Ĭ������������֡���_trigger("change")ʵ�ʻᴥ��"tabschange"�¼�
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
            // ����element�а󶨵��¼�
            this.element.trigger( event, data );
            return !( $.isFunction(callback) &&
            callback.call( this.element[0], event, data ) === false ||
            event.isDefaultPrevented() );
        }
    };

})( jQuery );  