/*All rights reserved Robótica Fácil*/

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'blockly-bq', 'blockly.blocks'], factory);
    } else {
        factory(_, window.Blockly, window.Blocks);
    }
}(function(_, Blockly, Blocks) {
    var load = function(options) {
        //Facilino={};
        Facilino.Arduino={};
        Facilino.Blocks={};
		Facilino.NumMelodies=0;
		
		Facilino.getStates = function() {
			states = [];
			for (var x=0;x<Facilino.NumStates;x++)
				states.push(x);
			return states;
		}
		
		Facilino.locales = {
            defaultLanguage: {},
            hardware: ''
        };
		
		Facilino.locales.setLang = function(lang) {
			this.defaultLanguage = lang;
		}
        Facilino.locales.getKey = function(key) {
			if (this.defaultLanguage[key]===undefined)
				console.log(key);
            return this.defaultLanguage[key] || this.EngLanguage[key];
        };
		
		Facilino.locales.setKey = function(key,value) {
            this.defaultLanguage[key]=value;
        };
        
        Facilino.locales.initialize = function() {
			this.defaultLanguage = options.langKeys ||window.langKeys || {};
			this.EngLanguage = window.langKeysEng;
			//console.log(this.defaultLanguage);
			this.hardware = options.proc || window.FacilinoHardware;
			return this;
        };

        Facilino.locales.initialize();
        Facilino.variables = {};
        Facilino.isVariable = function(varValue) {
            for (var i in Blockly.Variables.allUsedVariables) {
                if (Blockly.Variables.allUsedVariables[i] === varValue) {
                    return true;
                }
            }
            if (Facilino.variables[varValue] !== undefined) {
                return true;
            }
            if (varValue.search('digitalRead\\(') >= 0 || varValue.search('analogRead\\(') >= 0) {
                return true;
            }
            return false;
        };

        Facilino.findPinMode = function(dropdown_pin) {
            var code = '';
            dropdown_pin = dropdown_pin.split(';\n');
            for (var j in dropdown_pin) {
                if (dropdown_pin[j].search('pinMode') >= 0) {
                    code += dropdown_pin[j] + ';\n';
                } else {
                    dropdown_pin = dropdown_pin[j];
                }
            }
            return {
                'code': code,
                'pin': dropdown_pin
            };
        };
		
			Facilino.hexToRgb = function(hex) {
				// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
				var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
				hex = hex.replace(shorthandRegex, function(m, r, g, b) {
					return r + r + g + g + b + b;
				});

				var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
				return result ? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16)
				} : null;
			};
			
			Facilino.pad = function(str,padString,length) {
				while (str.length < length)
					str = padString + str;
				return str;
			}
		
		var profiles;
		$.ajax({
				url: 'profiles.json',
				dataType: "text",
				async: false,
				}).done(function(text) {
				profiles = $.parseJSON(text);
				if (Facilino.locales.hardware==='ArduinoNano')
					profiles['default'] = profiles.arduinoNano;
				else if (Facilino.locales.hardware==='ArduinoUno')
					profiles['default'] = profiles.arduinoUno;
				else if (Facilino.locales.hardware==='EasyPlug')
					profiles['default'] = profiles.easyPlug;
				else 
					profiles['default'] = profiles.arduinoNano;
				});
			
        // RGB block colors
        Facilino.LANG_COLOUR_DISTANCE = '#D04141';
        Facilino.LANG_COLOUR_SOUND = '#CC7B44';
        Facilino.LANG_COLOUR_MOVEMENT = '#CECE42';
        Facilino.LANG_COLOUR_SCREEN = '#ACCE42';
        Facilino.LANG_COLOUR_CONTROL = '#44CC44';
		Facilino.LANG_COLOUR_LOGIC = '#42CE91';
        Facilino.LANG_COLOUR_MATH = '#42CBCE';
        Facilino.LANG_COLOUR_TEXT = '#42A3CE';
        Facilino.LANG_COLOUR_COMMUNICATION = '#4263CE';
        Facilino.LANG_COLOUR_ADVANCED = '#9142CE';
		Facilino.LANG_COLOUR_VARIABLES = '#B244CC';
        Facilino.LANG_COLOUR_PROCEDURES = '#CE42B3';
		Facilino.LANG_COLOUR_LIGHT= '#FF8A00';
		Facilino.LANG_COLOUR_AMBIENT = '#99CCFF';
		Facilino.LANG_COLOUR_DEPRECATED = '#000000';
		
		Blockly.getBlocks = function() {

            var blocks = { };

            for (var block in this.Blocks) {
                // important check that this is objects own property 
                // not from prototype prop inherited
                if (this.Blocks.hasOwnProperty(block) && this.Blocks[block] instanceof Object) {
                    var category = this.Blocks[block].category;
					var subcategory = this.Blocks[block].subcategory;
					var colour = this.Blocks[block].category_colour;
					if (subcategory===undefined)
						subcategory='root';
                    blocks[category] = blocks[category] || { };
					blocks[category][subcategory] = blocks[category][subcategory] || [];
                    blocks[category][subcategory].push(block);
                }
            }
			return blocks;
		};
		
		Blockly.createToolbox = function() {

            var blocks = { };
			var colours = { };

            for (var block in this.Blocks) {
                // important check that this is objects own property 
                // not from prototype prop inherited
                if (this.Blocks.hasOwnProperty(block) && this.Blocks[block] instanceof Object && this.Blocks[block].category) {
                    var category = this.Blocks[block].category;
					var subcategory = this.Blocks[block].subcategory;
					var colour = this.Blocks[block].category_colour;
					var subsubcategory = this.Blocks[block].subsubcategory;
					if (subcategory===undefined)
						subcategory='root';
					if (subsubcategory===undefined)
						subsubcategory='root';
                    blocks[category] = blocks[category] || { };
					colours[category] = colours[category] || colour;
					blocks[category][subcategory] = blocks[category][subcategory] || [];
					blocks[category][subcategory][subsubcategory] = blocks[category][subcategory][subsubcategory] || [];
                    blocks[category][subcategory][subsubcategory].push(block);
                }
            }

            var toolbox = '<xml id="toolbox" style="display: none">';

            var categoryItem = function(type) {
                toolbox += '<block type="' + type + '"></block>';
            };

            for (category in blocks) {
                if (blocks.hasOwnProperty(category)) {
					toolbox += '<category id="' + category + '" name="' + category + '" colour="'+colours[category]+'">';
					for (subcategory in blocks[category]) {
						if (subcategory==='root')
							blocks[category]['root']['root'].forEach(categoryItem);
						if (subcategory!=='root'){
							//console.log(blocks);
							toolbox += '<category id="' + subcategory + '" name="' + subcategory + '" colour="'+this.Blocks[blocks[category][subcategory]['root'][0]].colour+'">';
							for (subsubcategory in blocks[category][subcategory])
							{
								if (subsubcategory==='root')
								{
									blocks[category][subcategory]['root'].forEach(categoryItem);
								}
								if (subsubcategory!=='root')
								{
									toolbox += '<category id="' + subsubcategory + '" name="' + subsubcategory + '" colour="'+this.Blocks[blocks[category][subcategory][subsubcategory][0]].colour+'">';
									blocks[category][subcategory][subsubcategory].forEach(categoryItem);
									toolbox += '</category>';
								}
							}
							toolbox += '</category>';
						}
					}
					toolbox += '</category>';
                }

            }
            toolbox += '</xml>';

            return toolbox;
        };
		
		Blockly.createToolboxColours = function() {

            var blocks = {};

            for (var block in this.Blocks) {
                if (this.Blocks.hasOwnProperty(block) && this.Blocks[block] instanceof Object && this.Blocks[block].category) {
                    var category = this.Blocks[block].category;
                    blocks[category] = blocks[category] || [];
					if (this.Blocks[block].colour !== undefined)
					{
						blocks[category].push(this.Blocks[block].colour);
					}
                }
            }
			return blocks;
        };

    this["JST"] = this["JST"] || {};

        this["JST"]["controls_else"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'else {\n' +
                    ((__t = (branch)) == null ? '' : __t) +
                    ' }';

            }
            return __p
        };

        this["JST"]["controls_elseif"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'else if (' +
                    ((__t = (argument)) == null ? '' : __t) +
                    ') {\n' +
                    ((__t = (branch)) == null ? '' : __t) +
                    ' }';

            }
            return __p
        };

        this["JST"]["controls_if"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'if (' +
                    ((__t = (argument)) == null ? '' : __t) +
                    ') {\n' +
                    ((__t = (branch)) == null ? '' : __t) +
                    ' }';

            }
            return __p
        };

        this["JST"]["controls_setupLoop"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (branch)) == null ? '' : __t) +
                    '\n';

            }
            return __p
        };

        this["JST"]["controls_whileUntil"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'while (' +
                    ((__t = (argument0)) == null ? '' : __t) +
                    ') {\n' +
                    ((__t = (branch)) == null ? '' : __t) +
                    ' }\n';

            }
            return __p
        };

        this["JST"]["inout_analog_read"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'analogRead(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ')';
            }
            return __p
        };

        this["JST"]["inout_analog_read_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'pinMode(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ',INPUT);\n';

            }
            return __p
        };

        this["JST"]["inout_analog_write"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'analogWrite(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ',' +
                    ((__t = (value_num)) == null ? '' : __t) +
                    ');\n';

            }
            return __p
        };

        this["JST"]["inout_analog_write_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'pinMode(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ',OUTPUT);\n';

            }
            return __p
        };

        this["JST"]["inout_builtin_led"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
				__p += 'digitalWrite(13,' +((__t = (dropdown_stat)) == null ? '' : __t) +');\n';
            }
            return __p
        };

        this["JST"]["inout_builtin_led_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
				__p += 'pinMode(13,OUTPUT);\n';
            }
            return __p
        };
		
		
		this["JST"]["inout_digital_write"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'digitalWrite(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ',' +
                    ((__t = (dropdown_stat)) == null ? '' : __t) +
                    ');\n';

            }
            return __p
        };


        this["JST"]["inout_digital_read"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'digitalRead(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ')';

            }
            return __p
        };

        this["JST"]["inout_digital_read_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'pinMode(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ',INPUT);\n';

            }
            return __p
        };

        this["JST"]["inout_digital_write"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'digitalWrite(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ',' +
                    ((__t = (dropdown_stat)) == null ? '' : __t) +
                    ');\n';

            }
            return __p
        };

        this["JST"]["inout_digital_write_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'pinMode(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ',OUTPUT);\n';

            }
            return __p
        };

        this["JST"]["logic_compare"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (argument0)) == null ? '' : __t) +
                    ' ' +
                    ((__t = (operator)) == null ? '' : __t) +
                    ' ' +
                    ((__t = (argument1)) == null ? '' : __t);

            }
            return __p
        };

        this["JST"]["logic_negate"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '!' +
                    ((__t = (argument0)) == null ? '' : __t);

            }
            return __p
        };

        this["JST"]["logic_operation"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (argument0)) == null ? '' : __t) +
                    ' ' +
                    ((__t = (operator)) == null ? '' : __t) +
                    ' ' +
                    ((__t = (argument1)) == null ? '' : __t);

            }
            return __p
        };

        this["JST"]["math_arithmetic"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (argument0)) == null ? '' : __t) +
                    '' +
                    ((__t = (operator)) == null ? '' : __t) +
                    '' +
                    ((__t = (argument1)) == null ? '' : __t);

            }
            return __p
        };

        
		this["JST"]["math_random_bitOut"] = function (obj) {
			obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'unsigned int bitOut(void)\n{\n  static unsigned long firstTime=1, prev=0;\n  unsigned long bit1=0, bit0=0, x=0, port=0, limit=99;\n  if (firstTime)\n  {\n    firstTime=0;\n    prev=analogRead(port);\n  }\n  while (limit--)\n  {\n    x=analogRead(port);\n    bit1=(prev!=x?1:0);\n    prev=x;\n    x=analogRead(port);\n    bit0=(prev!=x?1:0);\n    prev=x;\n    if (bit1!=bit0)\n      break;\n  }\n  return bit1;\n}\n';
            }
            return __p;
		}
		
		this["JST"]["math_random_seedOut"] = function (obj) {
			obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'unsigned long seedOut(unsigned int noOfBits)\n{\n  unsigned long seed=0;\n  for (int i=0;i<noOfBits;++i)\n    seed = (seed<<1) | bitOut();\n  return seed;\n}\n';
            }
            return __p;
        }
		this["JST"]["math_random"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'random(' +
                    ((__t = (value_num)) == null ? '' : __t) +
                    ',' +
                    ((__t = (value_dmax)) == null ? '' : __t) +
                    ')';

            }
            return __p
        };

        this["JST"]["procedures_callnoreturn"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (funcName)) == null ? '' : __t) +
                    '(' +
                    ((__t = (funcArgs)) == null ? '' : __t) +
                    ');\n';

            }
            return __p
        };

        this["JST"]["procedures_callreturn"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (funcName)) == null ? '' : __t) +
                    '(' +
                    ((__t = (funcArgs)) == null ? '' : __t) +
                    ')';

            }
            return __p
        };

        this["JST"]["procedures_defnoreturn"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (returnType)) == null ? '' : __t) +
                    ' ' +
                    ((__t = (funcName)) == null ? '' : __t) +
                    ' (' +
                    ((__t = (args)) == null ? '' : __t) +
                    ') {\n' +
                    ((__t = (branch)) == null ? '' : __t) +
                    ' }\n';

            }
            return __p
        };

        this["JST"]["procedures_defreturn"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (returnType)) == null ? '' : __t) +
                    ' ' +
                    ((__t = (funcName)) == null ? '' : __t) +
                    ' (' +
                    ((__t = (args)) == null ? '' : __t) +
                    ') {\n' +
                    ((__t = (branch)) == null ? '' : __t) +
                    '\n' +
                    ((__t = (returnValue)) == null ? '' : __t) +
                    ' }\n';

            }
            return __p
        };

        this["JST"]["serial_available"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'if (Serial.available()>0){\n' +
                    ((__t = (branch)) == null ? '' : __t) +
                    '\n}\n';

            }
            return __p
        };

        this["JST"]["serial_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'Serial.begin(' +
                    ((__t = (bitrate)) == null ? '' : __t) +
                    ');\n';

            }
            return __p
        };


        this["JST"]["text_equalsIgnoreCase"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (string1)) == null ? '' : __t) +
                    '.equalsIgnoreCase(' +
                    ((__t = (string2)) == null ? '' : __t) +
                    ')';

            }
            return __p
        };

        this["JST"]["text_length"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (argument0)) == null ? '' : __t) +
                    '.length()';

            }
            return __p
        };
		
		this["JST"]["text_lower"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (argument0)) == null ? '' : __t) +
                    '.toLowerCase()';

            }
            return __p
        };
		
		this["JST"]["text_upper"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (argument0)) == null ? '' : __t) +
                    '.toUpperCase()';

            }
            return __p
        };

        this["JST"]["text_substring"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (string1)) == null ? '' : __t) +
                    '.substring(' +
                    ((__t = (from)) == null ? '' : __t) +
                    ',' +
                    ((__t = (to)) == null ? '' : __t) +
                    ')';
            }
            return __p
        };

        this["JST"]["variables_set"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +=
                    ((__t = (varName)) == null ? '' : __t) +
                    '=' +
                    ((__t = (varValue)) == null ? '' : __t) +
                    ';\n';

            }
            return __p
        };

    this["JST"]["led_matrix_definition_expression"] = function(obj) {
        obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'void expression(int cs, int din, int clk, int col1, int col2, int col3, int col4, int col5, int col6, int col7, int col8) {\nwriteRow(cs,din,clk,1, col1);\nwriteRow(cs,din,clk,2, col2);\nwriteRow(cs,din,clk,3, col3);\nwriteRow(cs,din,clk,4, col4);\nwriteRow(cs,din,clk,5, col5);\nwriteRow(cs,din,clk,6, col6);\nwriteRow(cs,din,clk,7, col7);\nwriteRow(cs,din,clk,8, col8);\n}\n';
            }
        return __p
    };


    this["JST"]["led_matrix_definitions_writeRow"] = function(obj) {
        obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'void writeRow(int cs, int din, int clk, int row, int data) {\ndigitalWrite(cs,LOW);\nputByte(din,clk,row);\nputByte(din,clk,data);\ndigitalWrite(cs,LOW);\ndigitalWrite(cs,HIGH);\n}\n';
            }
        return __p
    };

    this["JST"]["led_matrix_definitions_maxAll"] = function(obj) {
        obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'void maxAll (int cs, int din, int clk, int reg, int col) {\ndigitalWrite(cs,LOW);\nputByte(din,clk,reg);\nputByte(din,clk,col);\ndigitalWrite(cs,LOW);\ndigitalWrite(cs,HIGH);\n}\n';
            }
        return __p
    };
    
    this["JST"]["led_matrix_definitions_putByte"] = function(obj) {
        obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'void putByte (int din, int clk, int data) {\nbyte i = 8;\nbyte mask;\nwhile(i > 0) {mask = 0x01 << (i - 1);\n    digitalWrite(clk,LOW);\n    if (data & mask)\n{\n      digitalWrite(din,HIGH);\n    }else{\n      digitalWrite(din,LOW);\n    }\n    digitalWrite(clk,HIGH);\n    --i;\n}\n}\n';
            }
        return __p
    };

    this["JST"]["led_matrix_definitions_LEDMatrix_init"] = function(obj) {
        obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'void LEDMatrix_init(int cs, int din, int clk) {\nmaxAll(cs,din,clk,11,7);\nmaxAll(cs,din,clk,9,0);\nmaxAll(cs,din,clk,12,1);\nmaxAll(cs,din,clk,15,0);\nint i=0;\nfor (i = 1; i <= 8; i++) {\nmaxAll(cs,din,clk,i, 0);\n}\nmaxAll(cs,din,clk,10,15);\n}\n';
            }
        return __p
    };

    this["JST"]["led_matrix_setups_LEDMatrix"] = function(obj) {
        obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'maxAll('+((__t = (cs_pin)) == null ? '' : __t)+','+((__t = (din_pin)) == null ? '' : __t)+','+((__t = (clk_pin)) == null ? '' : __t)+',11,7);\n'+'  maxAll('+((__t = (cs_pin)) == null ? '' : __t)+','+((__t = (din_pin)) == null ? '' : __t)+','+((__t = (clk_pin)) == null ? '' : __t)+',9,0);\n'+'  maxAll('+((__t = (cs_pin)) == null ? '' : __t)+','+((__t = (din_pin)) == null ? '' : __t)+','+((__t = (clk_pin)) == null ? '' : __t)+',12,1);\n'+'  maxAll('+((__t = (cs_pin)) == null ? '' : __t)+','+((__t = (din_pin)) == null ? '' : __t)+','+((__t = (clk_pin)) == null ? '' : __t)+',15,0);\n'+'  int i=0;\n'+'  for (i = 1; i <= 8; i++)\n'+'    maxAll('+((__t = (cs_pin)) == null ? '' : __t)+','+((__t = (din_pin)) == null ? '' : __t)+','+((__t = (clk_pin)) == null ? '' : __t)+',i,0);\n'+'  maxAll('+((__t = (cs_pin)) == null ? '' : __t)+','+((__t = (din_pin)) == null ? '' : __t)+','+((__t = (clk_pin)) == null ? '' : __t)+',10,15);\n';
            }
        return __p
    };
	
	this["JST"]["pinmode_setups_clk"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'pinMode(' +
                    ((__t = (clk_pin)) == null ? '' : __t) +
                    ',OUTPUT);';
            }
            return __p
        };

    this["JST"]["pinmode_setups_dout"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'pinMode(' +
                    ((__t = (cs_pin)) == null ? '' : __t) +
                    ',OUTPUT);';
            }
            return __p
        };

    this["JST"]["pinmode_setups_din"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'pinMode(' +
                    ((__t = (din_pin)) == null ? '' : __t) +
                    ',OUTPUT);';
            }
            return __p
        };
		
		this["JST"]["servo_cont1"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '_servo' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    '.write((('+((__t = (value_speed)) == null ? '' : __t)+'*90)/100+90));\n';

            }
            return __p
        };


        this["JST"]["servo_move"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '_servo' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    '.write(' +
                    ((__t = (value_degree)) == null ? '' : __t) +
                    ');\n';

            }
            return __p
        };
	
	this["JST"]["one_wire_definitions_readTempC"] = function (obj) {
	obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'float readTempC()\n{\n tempSensor'+((__t = (pin)) == null ? '' : __t)+'.requestTemperatures();\n return tempSensor'+((__t = (pin)) == null ? '' : __t)+'.getTempCByIndex(0);\n}\n';
            }
            return __p	
	}

	
	this["JST"]["dallas_temp_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'tempSensor'+((__t = (pin)) == null ? '' : __t)+'.begin();\n';
            }
            return __p
        };
	
	this["JST"]["dht_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'sensor'+((__t = (type)) == null ? '' : __t)+'_'+((__t = (pin)) == null ? '' : __t)+'.begin();\n';
            }
            return __p
        };
		
	this["JST"]["one_wire_temp_readTempC"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'readTempC()';
            }
            return __p
        };
		
	this["JST"]["dallas_temp_definitions_include"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '#include <DallasTemperature.h>';
            }
            return __p
        };
	
	this["JST"]["one_wire_temp_definitions_include"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '#include <OneWire.h>';
            }
            return __p
        };
		
	this["JST"]["one_wire_temp_definitions_variables"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'OneWire oneWire'+((__t = (pin)) == null ? '' : __t)+'('+((__t = (pin)) == null ? '' : __t)+');\n';
            }
            return __p
        };
		
	this["JST"]["dallas_temp_definitions_variables"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'DallasTemperature tempSensor'+((__t = (pin)) == null ? '' : __t)+'(&oneWire'+((__t = (pin)) == null ? '' : __t)+');\n';
            }
            return __p
        };
		
	this["JST"]["dht_definitions_include"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '#include <DHT.h>';			
            }
            return __p
        };
				
		this["JST"]["dht_definitions_variables"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'DHT sensor'+((__t = (type)) == null ? '' : __t)+'_'+((__t = (pin)) == null ? '' : __t)+'('+((__t = (pin)) == null ? '' : __t)+','+((__t = (type)) == null ? '' : __t)+');\n';			
            }
            return __p
        };
		
		this["JST"]["wire_definitions_include"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '#include <Wire.h>';			
            }
            return __p
        };
		
		this["JST"]["bmp_definitions_include"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '#include <Adafruit_BMP085.h>';			
            }
            return __p
        };
		
		this["JST"]["servo_definitions_variables"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'Servo _servo'+((__t = (pin)) == null ? '' : __t)+';\n';
            }
            return __p
        };

        this["JST"]["servo_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '_servo' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    '.attach(' +
                    ((__t = (dropdown_pin)) == null ? '' : __t) +
                    ');';
            }
            return __p
        };

    this["JST"]["distance_us"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'distance(' +
                    ((__t = (trigger_pin)) == null ? '' : __t) +
                    ',' +
                    ((__t = (echo_pin)) == null ? '' : __t) +
                    ')';

            }
            return __p
        };

    this["JST"]["distance_us_collision"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'if (distance(' +
                    ((__t = (trigger_pin)) == null ? '' : __t) +
                    ',' +
                    ((__t = (echo_pin)) == null ? '' : __t) +
                    ')<(' +
            ((__t = (distance)) == null ? '' : __t) +
            ')){\n' +
            ((__t = (collision)) == null ? '' : __t) +
            '\n}\nelse\n{\n' +
            ((__t = (not_collision)) == null ? '' : __t) +
            '}';
            }
            return __p
        };

	this["JST"]["distance_us_definitions_include"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '#include <wiring_private.h>\n#include <pins_arduino.h>\n';
            }
            return __p
        };


	this["JST"]["distance_us_definitions_pulseIn"] = function (obj) {
	obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'unsigned long _pulseIn(uint8_t pin, uint8_t state, unsigned long timeout)\n{\n  uint8_t bit = digitalPinToBitMask(pin);\n  uint8_t port = digitalPinToPort(pin);\n  uint8_t stateMask = (state ? bit : 0);\n  unsigned long width = 0;\n  unsigned long numloops = 0;\n  unsigned long maxloops = microsecondsToClockCycles(timeout) / 16;\n  while ((*portInputRegister(port) & bit) == stateMask)\n    if (numloops++ == maxloops)\n      return 0;\n  while ((*portInputRegister(port) & bit) != stateMask)\n    if (numloops++ == maxloops)\n      return 0;\n  while ((*portInputRegister(port) & bit) == stateMask) {\n    if (numloops++ == maxloops)\n      return 0;\n    width++;\n  }\n  return clockCyclesToMicroseconds(width * 21 + 16);\n}\n';

            }
            return __p	
	};

        this["JST"]["distance_us_definitions_distance"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'long distance(int trigger_pin, int echo_pin)\n{\n  long microseconds = US_init(trigger_pin, echo_pin);\n  long distance;\n  distance = microseconds/29/2;\n  if (distance == 0){\n    distance = 999;\n  }\n  return distance;\n}\n';

            }
            return __p
        };

        this["JST"]["distance_us_definitions_us_init"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
				__p += 'long US_init(int trigger_pin, int echo_pin)\n{\n  digitalWrite(trigger_pin, LOW);\n  delayMicroseconds(2);\n  digitalWrite(trigger_pin, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trigger_pin, LOW);\n  long microseconds = _pulseIn(echo_pin ,HIGH,100000);\n  return microseconds;\n}\n';
            }
            return __p
        };

        this["JST"]["distance_us_setups_echo"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'pinMode(' +
                    ((__t = (echo_pin)) == null ? '' : __t) +
                    ',INPUT);';
            }
            return __p
        };

        this["JST"]["distance_us_setups_trigger"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'pinMode(' +
                    ((__t = (trigger_pin)) == null ? '' : __t) +
                    ',OUTPUT);';
            }
            return __p
        };

	this["JST"]["music_definitions_play_melody"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'void playMelody(int pin,const uint16_t* melody, int length)\n{\n  unsigned int note;\n  unsigned long duration;\n  uint16_t* melody_ptr=(uint16_t*)melody;\n  for (int i=0;i<length;i++)\n  {\n    note=*melody_ptr++;\n    duration=*melody_ptr++;\n    tone(pin,note,duration);\n    delay(duration);\n    noTone(pin);\n  }\n}\n';
            }
            return __p
        };


    this["JST"]["softwareserial_def_definitions"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '#include <SoftwareSerial.h>';

            }
            return __p
        };

        this["JST"]["bt_softwareserial_def_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
				__p += '  _bt_softwareSerial.begin(' +
                    ((__t = (baud_rate)) == null ? '' : __t) +
                    ');\n  _bt_softwareSerial.flush();\n';
            }
            return __p
        };
		
		this["JST"]["oled_definitions_include"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '#include <Adafruit_SSD1306.h>\n#include <splash.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SPITFT.h>\n#include <Adafruit_SPITFT_Macros.h>\n#include <gfxfont.h>\n';
            }
            return __p
        };
		this["JST"]["oled_definitions_define"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '#define OLED_RESET 4\nAdafruit_SSD1306 display(OLED_RESET);'
			}
            return __p
        };
		
		this["JST"]["controls_txt_oled"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '\ndisplay.setTextSize(' +dropdown_pin_size+ ');\ndisplay.setTextColor(WHITE);\ndisplay.setCursor(1,'+dropdown_pin_altura+');\ndisplay.print('+content1+');'	
				
            }
            return __p
        };
		
		this["JST"]["controls_txt2_oled"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '\ndisplay.println('+content2+');'	
				
            }
            return __p
        };
		this["JST"]["oled_end"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += 'display.display();\ndelay(250);'
			}
            return __p
        };
		
		this["JST"]["spi_definitions_include"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p += '#include <SPI.h>';
            }
            return __p
        };
		this["JST"]["oled_setups"] = function(obj) {
            obj || (obj = {});
            var __t, __p = '',
                __e = _.escape;
            with(obj) {
                __p +='\ndisplay.begin(SSD1306_SWITCHCAPVCC, 0x3C);\ndisplay.clearDisplay();\ndelay(250);'
            }
            return __p
        };
		
        var JST = this.JST;

        var indentSentences = function(sentences) {
            var splitted_sentences = sentences.split('\n');
            var final_sentences = '';
            for (var i in splitted_sentences) {
                final_sentences += '  ' + splitted_sentences[i] + '\n';
            }
            return final_sentences;
        };
        
		
		Blockly.Blocks.procedures_defnoreturn = {
		category: Facilino.locales.getKey('LANG_CATEGORY_PROCEDURES'),
		category_colour: Facilino.LANG_COLOUR_PROCEDURES,
		colour: Facilino.LANG_COLOUR_PROCEDURES,
		keys: ['LANG_PROCEDURES_DEFNORETURN_TOOLTIP'],
		init: function() {    	
		this.setColour(Facilino.LANG_COLOUR_PROCEDURES);
		var name = new Blockly.FieldTextInput('',Blockly.Procedures.rename);
		name.setSpellcheck(false);
        this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/function.svg",20*options.zoom, 20*options.zoom)).appendField(Facilino.locales.getKey('LANG_PROCEDURES_DEFNORETURN_PROCEDURE')).appendField(name,'NAME').appendField('', 'PARAMS');
        this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
		if ((this.workspace.options.comments || (this.workspace.options.parentWorkspace && this.workspace.options.parentWorkspace.options.comments)) && Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT) {
			this.setCommentText(Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT);
		}
        this.setTooltip(Facilino.locales.getKey('LANG_PROCEDURES_DEFNORETURN_TOOLTIP'));
        this.arguments_ = [];
        this.type_arguments_ = [];
		this.setStatements_(true);
		this.setInputsInline(false);
  },
  setStatements_: function(hasStatements) {
    if (this.hasStatements_ === hasStatements) {
      return;
    }
    if (hasStatements) {
      this.appendStatementInput('STACK').appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom, 16*options.zoom)).setCheck(['code','function']);
      if (this.getInput('RETURN')) {
        this.moveInputBefore('STACK', 'RETURN');
      }
    } else {
      this.removeInput('STACK', true);
    }
    this.hasStatements_ = hasStatements;
  },
  updateParams_: function() {
    var badArg = false;
    var hash = {};
    for (var i = 0; i < this.arguments_.length; i++) {
      if (hash['arg_' + this.arguments_[i].toLowerCase()]) {
        badArg = true;
        break;
      }
      hash['arg_' + this.arguments_[i].toLowerCase()] = true;
    }
    if (badArg) {
      this.setWarningText('Duplicate argument');
    } else {
      this.setWarningText(null);
    }
    var params = [];
    for (var i in this.arguments_) {
		try{
		params.push(this.arguments_[i]);
		}
		catch(e)
		{
		}
    }
    this.paramString = params.join(', ');
	this.paramString='('+this.paramString+')';
    Blockly.Events.disable();
    try {
      this.setFieldValue(this.paramString, 'PARAMS');
    } finally {
      Blockly.Events.enable();
    }
  },  
  mutationToDom: function(opt_paramIds) {
    var container = document.createElement('mutation');
    if (opt_paramIds) {
      container.setAttribute('name', this.getFieldValue('NAME'));
    }
    for (var i = 0; i < this.arguments_.length; i++) {
      var parameter = document.createElement('arg_name');
      parameter.setAttribute('name', this.arguments_[i]);
      if (opt_paramIds && this.paramIds_) {
        parameter.setAttribute('paramId', this.paramIds_[i]);
      }
      container.appendChild(parameter);
	  
	  parameter = document.createElement('arg_type');
	  try{
	  parameter.setAttribute('name', this.type_arguments_[i]);
	  if (opt_paramIds && this.paramIds_) {
        parameter.setAttribute('paramId', this.paramIds_[i]);
      }
	  }
	  catch(e)
	  {
	  }
	  container.appendChild(parameter);
    }
    if (!this.hasStatements_) {
      container.setAttribute('statements', 'false');
    }
    return container;
  },  
  domToMutation: function(xmlElement) {
    this.arguments_ = [];
    for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
	  if (childNode.nodeName.toLowerCase() === 'arg_name') {
        this.arguments_.push(childNode.getAttribute('name'));
      }
      if (childNode.nodeName.toLowerCase() === 'arg_type') {
		  try{
        this.type_arguments_.push(childNode.getAttribute('name'));
		  }
		  catch(e)
		  {
		  }
      }
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);
    this.setStatements_(xmlElement.getAttribute('statements') !== 'false');
  },  
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('procedures_mutatorcontainer');
    containerBlock.initSvg();
    if (this.getInput('RETURN')) {
      containerBlock.setFieldValue(this.hasStatements_ ? 'TRUE' : 'FALSE','STATEMENTS');
    } else {
      containerBlock.getInput('STATEMENT_INPUT').setVisible(false);
    }
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.arguments_.length; i++) {
      var paramBlock = workspace.newBlock('procedures_mutatorarg');
      paramBlock.initSvg();
	  paramBlock.setFieldValue(this.type_arguments_[i], 'TYPE');
      paramBlock.setFieldValue(this.arguments_[i], 'NAME');
      paramBlock.oldLocation = i;
      connection.connect(paramBlock.previousConnection);
      connection = paramBlock.nextConnection;
    }
    Blockly.Procedures.mutateCallers(this);
    return containerBlock;
  },    
  compose: function(containerBlock) {
    this.arguments_ = [];
	this.type_arguments_ = [];
    this.paramIds_ = [];
    var paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock) {
      this.arguments_.push(paramBlock.getFieldValue('NAME'));
	  this.type_arguments_.push(paramBlock.getFieldValue('TYPE'));
      this.paramIds_.push(paramBlock.id);
      paramBlock = paramBlock.nextConnection &&
          paramBlock.nextConnection.targetBlock();
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);
    var hasStatements = containerBlock.getFieldValue('STATEMENTS');
    if (hasStatements !== null) {
      hasStatements = hasStatements == 'TRUE';
      if (this.hasStatements_ != hasStatements) {
        if (hasStatements) {
          this.setStatements_(true);
          Blockly.Mutator.reconnect(this.statementConnection_, this, 'STACK');
          this.statementConnection_ = null;
        } else {
          var stackConnection = this.getInput('STACK').connection;
          this.statementConnection_ = stackConnection.targetConnection;
          if (this.statementConnection_) {
            var stackBlock = stackConnection.targetBlock();
            stackBlock.unplug();
            stackBlock.bumpNeighbours_();
          }
          this.setStatements_(false);
        }
      }
    }
  },
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, false];
  },
  getVars: function() {
    return this.arguments_;
  },
  renameVar: function(oldName, newName) {
    var change = false;
    for (var i = 0; i < this.arguments_.length; i++) {
      if (Blockly.Names.equals(oldName, this.arguments_[i])) {
        this.arguments_[i] = newName;
        change = true;
      }
    }
    if (change) {
      this.updateParams_();
      if (this.mutator.isVisible()) {
        var blocks = this.mutator.workspace_.getAllBlocks();
        for (var i = 0, block; block = blocks[i]; i++) {
          if (block.type == 'procedures_mutatorarg' &&
              Blockly.Names.equals(oldName, block.getFieldValue('NAME'))) {
            block.setFieldValue(newName, 'NAME');
          }
        }
      }
    }
  },
  validName: function(name) {
                if (name && name.length > 0) {
                    var i = 0;
                    while (i < name.length) {
                        if (!isNaN(parseFloat(name[i]))) {
                            name = name.substring(1, name.length);
                        } else {
                            break;
                        }
                    }
                    name = name.replace(/([ ])/g, '_');
                    name = name.replace(/([áàâä])/g, 'a');
                    name = name.replace(/([éèêë])/g, 'e');
                    name = name.replace(/([íìîï])/g, 'i');
                    name = name.replace(/([óòôö])/g, 'o');
                    name = name.replace(/([úùûü])/g, 'u');
                    name = name.replace(/([ñ])/g, 'n');
                    name = name.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&\Ç\%\=\~\{\}\¿\¡\"\@\:\;\-\"\·\|\º\ª\¨\'\·\?\?\ç\`\´\¨\^])/g, '');
                    i = 0;
                    while (i < name.length) {
                        if (!isNaN(parseFloat(name[i]))) {
                            name = name.substring(1, name.length);
                        } else {
                            break;
                        }
                    }
                    for (var j in Blockly.Arduino.RESERVED_WORDS_) {
                        this.reserved_words = Blockly.Arduino.RESERVED_WORDS_.split(',');
                        if (name === this.reserved_words[j]) {
                            this.setWarningText('Reserved word');
                            name = '';
                            break;
                        } else {
                            this.setWarningText(null);
                        }
                    }
                }
                return name;
            },
  callType_: 'procedures_callnoreturn',
  onchange: function() {
                if (this.last_procedure !== this.getFieldValue('NAME')) {
                    var name = this.getFieldValue('NAME');
                    name = this.validName(name);
                    try {
                        this.setFieldValue(name, 'NAME');
                    } catch (e) {}
                    this.last_procedure = name;
                }
            }
};
		
		Blockly.Blocks['procedures_mutatorcontainer'] = {
		colour: Facilino.LANG_COLOUR_PROCEDURES,
		keys: ['LANG_PROCEDURES_MUTATORCONTAINER_Field'],
		init: function() {
    this.appendDummyInput()
        .appendField(Facilino.locales.getKey('LANG_PROCEDURES_MUTATORCONTAINER_Field'));
		this.appendStatementInput('STACK').setCheck(['code','function']);
    this.appendDummyInput('STATEMENT_INPUT')
        .appendField(Blockly.Msg.PROCEDURES_ALLOW_STATEMENTS)
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'STATEMENTS');
    this.setColour(Facilino.LANG_COLOUR_PROCEDURES);
    this.setTooltip('');
    this.contextMenu = false;
  }
};
	
		Blockly.Blocks['procedures_mutatorarg'] = {
			colour: Facilino.LANG_COLOUR_PROCEDURES,
			keys: ['LANG_VARIABLES_TYPE_NUMBER','LANG_VARIABLES_TYPE_STRING'],
  init: function() {
    var field = new Blockly.FieldTextInput('x', this.validator_);
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage('img/blocks/box_in.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldDropdown([
                    [Facilino.locales.getKey('LANG_VARIABLES_TYPE_NUMBER'), 'float'],
					[Facilino.locales.getKey('LANG_VARIABLES_TYPE_BOOLEAN'), 'bool'],
					[Facilino.locales.getKey('LANG_VARIABLES_TYPE_STRING'), 'String']
                ]), 'TYPE').appendField(field, 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Facilino.LANG_COLOUR_PROCEDURES);
    this.setTooltip('');
    this.contextMenu = false;
    field.onFinishEditing_ = this.createNewVar_;
    field.onFinishEditing_('x');
  },
  onchange: function() {
	if (this.last_variable !== this.getFieldValue('NAME')) {
		var name = this.getFieldValue('NAME');
        name = this.validName(name);
        try {
			this.setFieldValue(name, 'NAME');
        } catch (e) {}
        this.last_variable = name;
    }
  },
  validName: Blockly.Blocks.procedures_defnoreturn.validName,
  validator_: function(newVar) {
    newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    return newVar || null;
  },
  createNewVar_: function(newText) {
    var source = this.sourceBlock_;
    if (source && source.workspace && source.workspace.options &&
        source.workspace.options.parentWorkspace) {
      source.workspace.options.parentWorkspace.createVariable(newText);
    }
  }
};
        Blockly.Arduino.procedures_defnoreturn = function() {
            var funcName = this.getFieldValue('NAME');
            var branch = Blockly.Arduino.statementToCode(this, 'STACK');
            branch = branch.replace(/&quot;/g, '"');
            if (Blockly.Arduino.INFINITE_LOOP_TRAP) {
                branch = Blockly.Arduino.INFINITE_LOOP_TRAP.replace(/%1/g, '\'' + this.id + '\'') + branch;
            }
            var returnType = 'void';
            var args = this.paramString;
            var code = JST['procedures_defnoreturn']({
                'returnType': returnType,
                'funcName': funcName,
                'args': args,
                'branch': branch
            });
            code = Blockly.Arduino.scrub_(this, code);
            Blockly.Arduino.definitions_[funcName] = code;
            return null;
        };
		
        Blockly.Arduino.procedures_defreturn = function() {
            var funcName = this.getFieldValue('NAME');
            var branch = Blockly.Arduino.statementToCode(this, 'STACK');
            branch = branch.replace(/&quot;/g, '"');

            if (Blockly.Arduino.INFINITE_LOOP_TRAP) {
                branch = Blockly.Arduino.INFINITE_LOOP_TRAP.replace(/%1/g, '\'' + this.id + '\'') + branch;
            }
            var returnValue = Blockly.Arduino.valueToCode(this, 'RETURN', Blockly.Arduino.ORDER_NONE) || '';
            var code = '';

            returnValue = returnValue.replace(/&quot;/g, '"');
            if (returnValue) {
                var a = Facilino.findPinMode(returnValue);
                returnValue = a['code'];
                returnValue += '  return ' + a['pin'] + ';\n';
            }
			var returnType = this.getFieldValue('RETURN_TYPE');
            var args = this.paramString;
            code += JST['procedures_defreturn']({
                'returnType': returnType,
                'funcName': funcName,
                'args': args,
                'branch': branch,
                'returnValue': returnValue
            });
            code = Blockly.Arduino.scrub_(this, code);
            Blockly.Arduino.definitions_[funcName] = code;
            return null;
        };
		
		Blockly.Blocks.procedures_defreturn = {
		category: Facilino.locales.getKey('LANG_CATEGORY_PROCEDURES'),
        examples: ['procedures_callreturn_example.bly'],
		category_colour: Facilino.LANG_COLOUR_PROCEDURES,
		colour: Facilino.LANG_COLOUR_PROCEDURES,
		keys: ['LANG_PROCEDURES_DEFRETURN_PROCEDURE','LANG_VARIABLES_TYPE_NUMBER','LANG_VARIABLES_TYPE_STRING','LANG_PROCEDURES_DEFRETURN_TOOLTIP'],
		init: function() {
			var nameField = new Blockly.FieldTextInput('',Blockly.Procedures.rename);
			nameField.setSpellcheck(false);
			this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/function.svg",20*options.zoom, 20*options.zoom)).appendField(Facilino.locales.getKey('LANG_PROCEDURES_DEFRETURN_PROCEDURE')).appendField(nameField, 'NAME').appendField('', 'PARAMS');
			this.appendValueInput('RETURN').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown([
                    [Facilino.locales.getKey('LANG_VARIABLES_TYPE_NUMBER'), 'float'],
					[Facilino.locales.getKey('LANG_VARIABLES_TYPE_BOOLEAN'), 'bool'],
					[Facilino.locales.getKey('LANG_VARIABLES_TYPE_STRING'), 'String']
                ]), "RETURN_TYPE").appendField(new Blockly.FieldImage("img/blocks/return.svg",16*options.zoom, 16*options.zoom));
			this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
			if ((this.workspace.options.comments ||(this.workspace.options.parentWorkspace && this.workspace.options.parentWorkspace.options.comments)) && Blockly.Msg.PROCEDURES_DEFRETURN_COMMENT) {
			  this.setCommentText(Blockly.Msg.PROCEDURES_DEFRETURN_COMMENT);
			}
			this.setColour(Facilino.LANG_COLOUR_PROCEDURES);
			this.setTooltip(Facilino.locales.getKey('LANG_PROCEDURES_DEFRETURN_TOOLTIP'));
			this.arguments_ = [];
			this.type_arguments_ = [];
			this.setStatements_(true);
			this.statementConnection_ = null;
  },
  isVariable: function(varValue) {
                for (var i in Blockly.Variables.allUsedVariables) {
                    if (Blockly.Variables.allUsedVariables[i] === varValue) {
                        return true;
                    }
                }
                return false;
            },
  setStatements_: Blockly.Blocks['procedures_defnoreturn'].setStatements_,
  updateParams_: Blockly.Blocks['procedures_defnoreturn'].updateParams_,
  mutationToDom: Blockly.Blocks['procedures_defnoreturn'].mutationToDom,
  domToMutation: Blockly.Blocks['procedures_defnoreturn'].domToMutation,
  decompose: Blockly.Blocks['procedures_defnoreturn'].decompose,
  compose: Blockly.Blocks['procedures_defnoreturn'].compose,
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, true];
  },
  getVars: Blockly.Blocks['procedures_defnoreturn'].getVars,
  renameVar: Blockly.Blocks['procedures_defnoreturn'].renameVar,
  callType_: 'procedures_callreturn'
};
		
		Blockly.Arduino.procedures_callnoreturn = function() {
            var funcName = this.getFieldValue('PROCEDURES');
            var args = [];
            var code = '';
            var a;
            try {
                for (var x = 0; x < this.getVariables(funcName).length; x++) {
                    args[x] = Blockly.Arduino.valueToCode(this, 'ARG' + x, Blockly.Arduino.ORDER_NONE) || '';
                    a = Facilino.findPinMode(args[x]);
                    code += a['code'];
                    args[x] = a['pin'];
                }
            } catch (e) {}
            var funcArgs = args.join(', ');
            code += JST['procedures_callnoreturn']({
                'funcName': funcName,
                'funcArgs': funcArgs
            });
            return code;
        };
        Blockly.Blocks.procedures_callnoreturn = {
            // Variable getter.
            category: Facilino.locales.getKey('LANG_CATEGORY_PROCEDURES'), 
			category_colour: Facilino.LANG_COLOUR_PROCEDURES,
			colour: Facilino.LANG_COLOUR_PROCEDURES,
			keys: ['LANG_PROCEDURES_CALLNORETURN_TOOLTIP','LANG_PROCEDURES_DEFNORETURN_PROCEDURE','LANG_PROCEDURES_CALL_WITHOUT_DEFINITION'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_PROCEDURES);
                this.appendDummyInput('DUMMY').appendField(new Blockly.FieldImage("img/blocks/function.svg",20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldDropdown(this.getProcedures()), 'PROCEDURES');
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_PROCEDURES_CALLNORETURN_TOOLTIP'));
                this.arguments_ = this.getVariables(this.getFieldValue('PROCEDURES'));
                this.quarkConnections_ = null;
                this.quarkArguments_ = null;
                this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
				this.setInputsInline(false);
            },
            validName: function(name) {
                if (name && name.length > 0) {
                    var i = 0;
                    while (i < name.length) {
                        if (!isNaN(parseFloat(name[i]))) {
                            name = name.substring(1, name.length);
                        } else {
                            break;
                        }
                    }
                    name = name.replace(/([ ])/g, '_');
                    name = name.replace(/([áàâä])/g, 'a');
                    name = name.replace(/([éèêë])/g, 'e');
                    name = name.replace(/([íìîï])/g, 'i');
                    name = name.replace(/([óòôö])/g, 'o');
                    name = name.replace(/([úùûü])/g, 'u');
                    name = name.replace(/([ñ])/g, 'n');
                    name = name.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&\Ç\%\=\~\{\}\¿\¡\"\@\:\;\-\"\·\|\º\ª\¨\'\·\?\?\ç\`\´\¨\^])/g, '');
                    i = 0;
                    while (i < name.length) {
                        if (!isNaN(parseFloat(name[i]))) {
                            name = name.substring(1, name.length);
                        } else {
                            break;
                        }
                    }
                }
                return name;
            },
            getProcedures: function() {
                var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
                var procedures_dropdown = [];
                if (procedures[0].length > 0) {
                    for (var i in procedures[0]) {
                        var proc_name = procedures[0][i][0];
                        proc_name = this.validName(proc_name);
                        procedures_dropdown.push([proc_name, proc_name]);
                    }
                } else {
                    procedures_dropdown.push([Facilino.locales.getKey('LANG_PROCEDURES_DEFNORETURN_PROCEDURE'), Facilino.locales.getKey('LANG_PROCEDURES_DEFNORETURN_PROCEDURE')]);
                }
                return procedures_dropdown;
            },
            maxVariableNumber: function() {
                var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
                var procedures_dropdown = [];
                var max_num = 0;
                if (procedures[0].length > 0 || procedures[1].length > 0) {
                    for (var i in procedures[0]) {
                        if (procedures[0][i][1].length > max_num) {
                            max_num = procedures[0][i][1].length;
                        }
                    }
                    return max_num;
                } else {
                    procedures_dropdown.push(['', '']);
                }
            },
            getVariables: function(funcName) {
                try {
                    var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
                    var procedures_dropdown = [];
                    if (procedures[0].length > 0) {
                        for (var i in procedures[0]) {
                            if (procedures[0][i][0] === funcName) {
                                return procedures[0][i][1];
                            }
                        }
                    } else {
                        procedures_dropdown.push(['', '']);
                    }
                } catch (e) {}
            },
            exists: function() {
                var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
                if (procedures[0].length > 0) {
                    for (var i in procedures[0]) {
                        if (procedures[0][i][0] === this.getFieldValue('PROCEDURES')) {
                            return true;
                        }
                    }
                } else {
                    return false;
                }
            },
            onchange: function() {
                if (!this.workspace) {
                    // Block has been deleted.
                    return;
                }
				//console.log('Hello');
                if (this.getFieldValue('PROCEDURES') !== this.last_procedure && this.getFieldValue('PROCEDURES')) {
                    this.changeVariables();
                    this.last_procedure = this.getFieldValue('PROCEDURES');
                    this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
                } else if (this.getVariables(this.getFieldValue('PROCEDURES')) !== this.last_variables) {
                    this.addVariables();
                    this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
                    this.last_procedure = this.getFieldValue('PROCEDURES');
                }
                if (!this.exists()) {
                    try {
                        this.setWarningText(Facilino.locales.getKey('LANG_PROCEDURES_CALL_WITHOUT_DEFINITION'));
                    } catch (e) {}
                } else {
                    try {
                        this.setWarningText(null);
                    } catch (e) {}
                }
            },
            addVariables: function() {
                var func_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
                var var_num = 0;
                if (func_variables && this.getFieldValue('PROCEDURES')!=='') {
					if (!this.last_variables) {
                        this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
                    }
                    if (func_variables.length >= this.last_variables.length) {
                        var_num = func_variables.length;
                    } else if (this.last_variables) {
                        try {
                            var_num = this.last_variables.length;
                        } catch (e) {}
                    }
					for (var x = 0; x < var_num; x++) {
                        if (this.getInput('ARG' + x) === null) {
                            this.appendValueInput('ARG' + x).appendField(func_variables[x], 'ARG_NAME' + x).setAlign(Blockly.ALIGN_RIGHT);
                        } else {
                            if (func_variables[x] && this.getFieldValue('ARG_NAME' + x)) {
                                this.setFieldValue(func_variables[x], 'ARG_NAME' + x);
                            } else {
                                this.removeInput('ARG' + x);
                            }
                        }
                    }
                    this.arguments_ = func_variables;
                }
            },
            renameProcedure: function(oldName, newName) {
                if (this.last_procedure) {
					//console.log("Hello, I'm here");
                    var procedures = this.getProcedures();
                    for (var i in procedures) {
                        if (Blockly.Names.equals(oldName, procedures[i][0])) {
							//console.log("Hello, I'm here");
							this.setFieldValue(new Blockly.FieldDropdown(this.getProcedures()), 'PROCEDURES');
							this.addVariables();
                        }
                    }
                    if (this.last_procedure === oldName) {
                        this.last_procedure = newName;
                    }
                    try {
                        this.setFieldValue(this.last_procedure, 'PROCEDURES');
                    } catch (e) {}
                }
            },
            changeVariables: function() {
                var func_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
				for (var i = 0; i < this.maxVariableNumber(); i++) {
                    if (this.getInput('ARG' + i) === null) {
                        break;
                    }
                    this.removeInput('ARG' + i);
                }
                for (var variable in func_variables) {
                    this.appendValueInput('ARG' + variable).appendField(func_variables[variable]).setAlign(Blockly.ALIGN_RIGHT);
                }
                this.arguments_ = func_variables;
            },
            mutationToDom: function() {
                // Save the name and arguments (none of which are editable).
                var container = document.createElement('mutation');
                container.setAttribute('name', this.getFieldValue('PROCEDURES'));
                if (typeof this.arguments_ === 'undefined') {
                    this.arguments_ = this.getVariables(this.getFieldValue('PROCEDURES'));
                }
                if (typeof this.arguments_ === 'undefined') {
                    this.arguments_ = [];
                }
                for (var x = 0; x < this.arguments_.length; x++) {
                    var parameter = document.createElement('arg');
                    parameter.setAttribute('name', this.arguments_[x]);
                    container.appendChild(parameter);
                }
                return container;
            },
            domToMutation: function(xmlElement) {
                this.xmlElement = xmlElement;
                // Restore the name and parameters.
                var name = xmlElement.getAttribute('name');
                this.last_procedure = name;
                this.setFieldValue(name, 'PROCEDURES');
                for (var x = 0; x < xmlElement.childNodes.length; x++) {
                    this.appendValueInput('ARG' + x).appendField(xmlElement.childNodes[x].getAttribute('name'), 'ARG_NAME' + x).setAlign(Blockly.ALIGN_RIGHT);
                }
            }
        };
		
        Blockly.Arduino.procedures_callreturn = function() {
            // Call a procedure with a return value.
            var funcName = this.getFieldValue('PROCEDURES');
            var args = [];
            var a;
            var code = '';
            for (var x = 0; x < this.getVariables(funcName).length; x++) {
                args[x] = Blockly.Arduino.valueToCode(this, 'ARG' + x, Blockly.Arduino.ORDER_NONE) || 'null';

                a = Facilino.findPinMode(args[x]);
                code += a['code'];
                args[x] = a['pin'];
            }
            var funcArgs = args.join(', ');
            code += JST['procedures_callreturn']({
                'funcName': funcName,
                'funcArgs': funcArgs
            });
            //funcName + '(' + args.join(', ') + ')';
            return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
        };
        Blockly.Blocks.procedures_callreturn = {
            // Variable getter.
            category: Facilino.locales.getKey('LANG_CATEGORY_PROCEDURES'),
            category_colour: Facilino.LANG_COLOUR_PROCEDURES,
			colour: Facilino.LANG_COLOUR_PROCEDURES,
			keys: ['LANG_PROCEDURES_CALLRETURN_TOOLTIP','LANG_PROCEDURES_DEFRETURN_PROCEDURE','LANG_PROCEDURES_CALL_WITHOUT_DEFINITION2'],
			output: 'function',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_PROCEDURES);
                this.appendDummyInput('DUMMY').appendField(new Blockly.FieldImage("img/blocks/function.svg",20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldDropdown(this.getProcedures()), 'PROCEDURES');
                this.setOutput(true);
                this.setTooltip(Facilino.locales.getKey('LANG_PROCEDURES_CALLRETURN_TOOLTIP'));
                this.arguments_ = this.getVariables(this.getFieldValue('PROCEDURES'));
                this.quarkConnections_ = null;
                this.quarkArguments_ = null;
                this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
				this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
            },
            validName: function(name) {
                if (name && name.length > 0) {
                    var i = 0;
                    while (i < name.length) {
                        if (!isNaN(parseFloat(name[i]))) {
                            name = name.substring(1, name.length);
                        } else {
                            break;
                        }
                    }
                    name = name.replace(/([ ])/g, '_');
                    name = name.replace(/([áàâä])/g, 'a');
                    name = name.replace(/([éèêë])/g, 'e');
                    name = name.replace(/([íìîï])/g, 'i');
                    name = name.replace(/([óòôö])/g, 'o');
                    name = name.replace(/([úùûü])/g, 'u');
                    name = name.replace(/([ñ])/g, 'n');
                    name = name.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&\Ç\%\=\~\{\}\¿\¡\"\@\:\;\-\"\·\|\º\ª\¨\'\·\?\?\ç\`\´\¨\^])/g, '');
                    i = 0;
                    while (i < name.length) {
                        if (!isNaN(parseFloat(name[i]))) {
                            name = name.substring(1, name.length);
                        } else {
                            break;
                        }
                    }
                    for (var j in Blockly.Arduino.RESERVED_WORDS_) {
                        var reserved_words = Blockly.Arduino.RESERVED_WORDS_.split(',');
                        if (name === reserved_words[j]) {
                            this.setWarningText('Reserved word');
                            name = '';
                            break;
                        } else {
                            this.setWarningText(null);
                        }
                    }
                }
                return name;
            },
            getProcedures: function() {
                var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
                var procedures_dropdown = [];
                if (procedures[1].length > 0) {
                    for (var i in procedures[1]) {
                        var proc_name = procedures[1][i][0];
                        proc_name = this.validName(proc_name);
                        procedures_dropdown.push([proc_name, proc_name]);
                    }
                } else {
                    procedures_dropdown.push([Facilino.locales.getKey('LANG_PROCEDURES_DEFRETURN_PROCEDURE'), Facilino.locales.getKey('LANG_PROCEDURES_DEFRETURN_PROCEDURE')]);
                }
                return procedures_dropdown;
            },
            maxVariableNumber: function() {
                var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
                var procedures_dropdown = [];
                var max_num = 0;
                if (procedures[1].length > 0) {
                    for (var i in procedures[1]) {
                        if (procedures[1][i][1].length > max_num) { // if the length of the variable array is larger than the max_num, equal max_num to that number
                            max_num = procedures[1][i][1].length;
                        }
                    }
                    return max_num;
                } else {
                    procedures_dropdown.push(['', '']);
                }
            },
            getVariables: function(funcName) {
                try {
                    var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
                    var procedures_dropdown = [];
                    if (procedures[1].length > 0) {
                        for (var i in procedures[1]) {
                            if (procedures[1][i][0] === funcName) {
                                return procedures[1][i][1];
                            }
                        }
                    } else {
                        procedures_dropdown.push(['', '']);
                    }
                } catch (e) {}
            },
            exists: function() {
                var procedures = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
                if (procedures[1].length > 0) {
                    for (var i in procedures[1]) {
                        if (procedures[1][i][0] === this.getFieldValue('PROCEDURES')) {
                            return true;
                        }
                    }
                } else {
                    return false;
                }
            },
            onchange: function() {
                if (!this.workspace) {
                    return;
                }
                if (this.getFieldValue('PROCEDURES') !== this.last_procedure && this.getFieldValue('PROCEDURES')) {
                    this.changeVariables();
                    this.last_procedure = this.getFieldValue('PROCEDURES');
                    this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
                } else if (this.getVariables(this.getFieldValue('PROCEDURES')) !== this.last_variables) {
                    this.addVariables();
                    this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
                    this.last_procedure = this.getFieldValue('PROCEDURES');
                }
                if (!this.exists()) {
                    try {
                        this.setWarningText(Facilino.locales.getKey('LANG_PROCEDURES_CALL_WITHOUT_DEFINITION2'));
                    } catch (e) {}
                } else {
                    try {
                        this.setWarningText(null);
                    } catch (e) {}
                }
            },
            addVariables: function() {
                var func_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
                var var_num = 0;
                if (func_variables && this.getFieldValue('PROCEDURES')!=='') {
                    if (!this.last_variables) {
                        this.last_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
                    }
                    if (func_variables.length >= this.last_variables.length) {
                        var_num = func_variables.length;
                    } else if (this.last_variables) {
                        try {
                            var_num = this.last_variables.length;
                        } catch (e) {}
                    }
                    for (var x = 0; x < var_num; x++) {
                        if (this.getInput('ARG' + x) === null) {
                            this.appendValueInput('ARG' + x).appendField(func_variables[x], 'ARG_NAME' + x).setAlign(Blockly.ALIGN_RIGHT);
                        } else {
                            if (func_variables[x] && this.getFieldValue('ARG_NAME' + x)) {
                                this.setFieldValue(func_variables[x], 'ARG_NAME' + x);
                            } else {
                                this.removeInput('ARG' + x);
                            }
                        }
                    }
                    this.arguments_ = func_variables;
                }
            },
            renameProcedure: function(oldName, newName) {
                if (this.last_procedure) {
                    var procedures = this.getProcedures();
                    for (var i in procedures) {
                        if (Blockly.Names.equals(oldName, procedures[i][0])) {
							this.setFieldValue(new Blockly.FieldDropdown(this.getProcedures()), 'PROCEDURES');
                        }
                    }
                    if (this.last_procedure === oldName) {
                        this.last_procedure = newName;
                    }
                    try {
                        this.setFieldValue(this.last_procedure, 'PROCEDURES');
                    } catch (e) {}
                }
            },
            changeVariables: function() {
                var func_variables = this.getVariables(this.getFieldValue('PROCEDURES'));
                for (var i = 0; i < this.maxVariableNumber(); i++) {
                    if (this.getInput('ARG' + i) === null) {
                        break;
                    }
                    this.removeInput('ARG' + i);
                }
                for (var variable in func_variables) {
                    this.appendValueInput('ARG' + variable).appendField(func_variables[variable]).setAlign(Blockly.ALIGN_RIGHT);
                }
                this.arguments_ = func_variables;
            },
            mutationToDom: function() {
                var container = document.createElement('mutation');
                container.setAttribute('name', this.getFieldValue('PROCEDURES'));
                if (typeof this.arguments_ === 'undefined') {
                    this.arguments_ = this.getVariables(this.getFieldValue('PROCEDURES'));
                }
                if (typeof this.arguments_ === 'undefined') {
                    this.arguments_ = [];
                }
                for (var x = 0; x < this.arguments_.length; x++) {
                    var parameter = document.createElement('arg');
                    parameter.setAttribute('name', this.arguments_[x]);
                    container.appendChild(parameter);
                }
                return container;
            },
            domToMutation: function(xmlElement) {
                this.xmlElement = xmlElement;
                var name = xmlElement.getAttribute('name');
                this.last_procedure = name;
                this.setFieldValue(name, 'PROCEDURES');
                for (var x = 0; x < xmlElement.childNodes.length; x++) {
                    this.appendValueInput('ARG' + x).appendField(xmlElement.childNodes[x].getAttribute('name'), 'ARG_NAME' + x).setAlign(Blockly.ALIGN_RIGHT);
                }
            }
        };
       
        Blockly.Arduino.controls_setupLoop = function() {
            var branch = Blockly.Arduino.statementToCode(this, 'SETUP');
            branch = branch.replace(/&quot;/g, '"');

	    if (Blockly.Arduino.setups_['setup_int0_']) {
              branch += Blockly.Arduino.setups_['setup_int0_']
            }	    

            Blockly.Arduino.setups_['X_SETUP'] = JST['controls_setupLoop']({
                'branch': branch
            });

            var content = Blockly.Arduino.statementToCode(this, 'LOOP');
            content = content.replace(/&quot;/g, '"');
            content = JST['controls_setupLoop']({
                'branch': content
            });
            return content;
        };
        Blockly.Blocks.controls_setupLoop = {
            // Setup statements.
            category: Facilino.locales.getKey('LANG_CATEGORY_CONTROLS'),
            category_colour: Facilino.LANG_COLOUR_CONTROL,
			colour: Facilino.LANG_COLOUR_CONTROL,
			keys: ['LANG_CONTROLS_SETUP_LOOP_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_CONTROL);
                this.appendStatementInput('SETUP').appendField(new Blockly.FieldImage("img/blocks/setup.svg",20*options.zoom, 20*options.zoom)).setCheck('code');
                this.appendStatementInput('LOOP').appendField(new Blockly.FieldImage("img/blocks/loop.svg",20*options.zoom, 20*options.zoom)).setCheck('code');
                this.setPreviousStatement(false);
                this.setNextStatement(false);
                this.setTooltip(Facilino.locales.getKey('LANG_CONTROLS_SETUP_LOOP_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.controls_whileUntil = function() {
            // Do while/until loop.
            var argument0 = Blockly.Arduino.valueToCode(this, 'BOOL', Blockly.Arduino.ORDER_NONE) || '';
            argument0 = argument0.replace(/&quot;/g, '"');
            var branch = Blockly.Arduino.statementToCode(this, 'DO');
            branch = branch.replace(/&quot;/g, '"');

            var code = '';
            var a = Facilino.findPinMode(argument0);
            code += a['code'];
            argument0 = a['pin'];

            if (Blockly.Arduino.INFINITE_LOOP_TRAP) {
                branch = Blockly.Arduino.INFINITE_LOOP_TRAP.replace(/%1/g, '\'' + this.id + '\'') + branch;
            }
            if (this.getFieldValue('MODE') === 'UNTIL') {
                if (!argument0.match(/^\w+$/)) {
                    argument0 = '(' + argument0 + ')';
                }
                argument0 = '!' + argument0;
            }
            code += JST['controls_whileUntil']({
                'argument0': argument0,
                'branch': branch
            });
            return code;
        };
        Blockly.Blocks.controls_whileUntil = {
            category: Facilino.locales.getKey('LANG_CATEGORY_CONTROLS'),
            category_colour: Facilino.LANG_COLOUR_CONTROL,
			colour: Facilino.LANG_COLOUR_CONTROL,
			keys: ['LANG_CONTROLS_WHILEUNTIL_OPERATOR_WHILE','LANG_CONTROLS_WHILEUNTIL_OPERATOR_UNTIL','LANG_CONTROLS_WHILEUNTIL_TOOLTIP_WHILE','LANG_CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_CONTROL);
                this.appendValueInput('BOOL').appendField(new Blockly.FieldImage("img/blocks/loop.svg",20*options.zoom, 20*options.zoom)).setCheck(Boolean).appendField(new Blockly.FieldDropdown([
                    [Facilino.locales.getKey('LANG_CONTROLS_WHILEUNTIL_OPERATOR_WHILE'), 'WHILE'],
                    [Facilino.locales.getKey('LANG_CONTROLS_WHILEUNTIL_OPERATOR_UNTIL'), 'UNTIL']
                ]), 'MODE').appendField(new Blockly.FieldImage("img/blocks/binary.svg",20*options.zoom, 20*options.zoom));
                this.appendStatementInput('DO').appendField(new Blockly.FieldImage("img/blocks/do.svg",20*options.zoom, 20*options.zoom));
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                // Assign 'this' to a variable for use in the tooltip closure below.
                var thisBlock = this;
                this.setTooltip(function() {
                    var op = thisBlock.getFieldValue('MODE');
                    return Blockly.Blocks.controls_whileUntil.TOOLTIPS[op];
                });
            }
        };
        Blockly.Blocks.controls_whileUntil.TOOLTIPS = {
            WHILE: Facilino.locales.getKey('LANG_CONTROLS_WHILEUNTIL_TOOLTIP_WHILE'),
            UNTIL: Facilino.locales.getKey('LANG_CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL')
        };
		
		Blockly.Arduino.controls_for = function() {
            var argument1 = Blockly.Arduino.valueToCode(this, 'TO', Blockly.Arduino.ORDER_ASSIGNMENT) || '';
            var branch = Blockly.Arduino.statementToCode(this, 'DO');
            if (Blockly.Arduino.INFINITE_LOOP_TRAP) {
                branch = Blockly.Arduino.INFINITE_LOOP_TRAP.replace(/%1/g, '\'' + this.id + '\'') + branch;
            }
			var varName= 'pepe';
			var varType='int';
			var varValue='1';
            var code = '';
			var to_input=this.getInputTargetBlock('TO');
			if (to_input)
			{
				code += 'for (int iteration=1;'+'iteration<=' + argument1 + ';iteration++' + ') {\n' + branch + '}\n';
            }
			return code;
        };
        Blockly.Blocks.controls_for = {
            // For loop.
            category: Facilino.locales.getKey('LANG_CATEGORY_CONTROLS'),
            category_colour: Facilino.LANG_COLOUR_CONTROL,
			colour: Facilino.LANG_COLOUR_CONTROL,
			keys: ['LANG_CONTROLS_FOR_TOOLTIP','LANG_CONTROLS_FOR_LOOP_WARNING4'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_CONTROL);
                this.appendValueInput('TO').appendField(new Blockly.FieldImage("img/blocks/loop.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/numbers.svg',20*options.zoom,20*options.zoom)).setCheck(Number);
                this.appendStatementInput('DO').appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom,16*options.zoom)).setCheck('code');
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setInputsInline(true);
                var thisBlock = this;
                this.setTooltip(Facilino.locales.getKey('LANG_CONTROLS_FOR_TOOLTIP'));
            },
			getVars: function() {
                return ['iteration'];
            },
            onchange: function() {
				var to_input=this.getInputTargetBlock('TO');
				if (to_input)
					this.setWarningText(null);
				else
					this.setWarningText(Facilino.locales.getKey('LANG_CONTROLS_FOR_LOOP_WARNING4'));
            }
        };
		
        Blockly.Arduino.controls_if = function() {
            var n = 0;
            var argument = Blockly.Arduino.valueToCode(this, 'IF' + n, Blockly.Arduino.ORDER_NONE);
            argument = argument.replace(/&quot;/g, '"');

            var branch = Blockly.Arduino.statementToCode(this, 'DO' + n);

            var code = '';
            var a = Facilino.findPinMode(argument);
            code += a['code'];
            argument = a['pin'];

            code += JST['controls_if']({
                'argument': argument,
                'branch': branch
            });


            for (n = 1; n <= this.elseifCount_; n++) {
                argument = Blockly.Arduino.valueToCode(this, 'IF' + n, Blockly.Arduino.ORDER_NONE);
                branch = Blockly.Arduino.statementToCode(this, 'DO' + n);
                code += JST['controls_elseif']({
                    'argument': argument,
                    'branch': branch
                });
            }
            if (this.elseCount_) {
                branch = Blockly.Arduino.statementToCode(this, 'ELSE');
                code += JST['controls_else']({
                    'argument': argument,
                    'branch': branch
                });
            }
            branch = branch.replace(/&quot;/g, '"');
            code = code.replace(/&quot;/g, '"');

            return code + '\n';
        };

        Blockly.Blocks.controls_if = {
            category: Facilino.locales.getKey('LANG_CATEGORY_CONTROLS'),
            category_colour: Facilino.LANG_COLOUR_CONTROL,
			colour: Facilino.LANG_COLOUR_CONTROL,
			keys: ['LANG_CONTROLS_IF_MSG_IF','LANG_CONTROLS_IF_MSG_THEN','LANG_CONTROLS_IF_TOOLTIP_1','LANG_CONTROLS_IF_ELSEIF_Field_ELSEIF','LANG_CONTROLS_IF_MSG_THEN','LANG_CONTROLS_IF_ELSE_Field_ELSE'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_CONTROL);
                this.appendValueInput('IF0').setCheck(Boolean).appendField(new Blockly.FieldImage("img/blocks/decision.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage("img/blocks/binary.svg",20*options.zoom,20*options.zoom));
                this.appendStatementInput('DO0').appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom, 16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setMutator(new Blockly.Mutator(['controls_if_elseif',
                    'controls_if_else'
                ]));
                var thisBlock = this;
                this.setTooltip(Facilino.locales.getKey('LANG_CONTROLS_IF_TOOLTIP_1'));
                this.elseifCount_ = 0;
                this.elseCount_ = 0;
            },
            mutationToDom: function() {
                if (!this.elseifCount_ && !this.elseCount_) {
                    return null;
                }
                var container = document.createElement('mutation');
                if (this.elseifCount_) {
                    container.setAttribute('elseif', this.elseifCount_);
                }
                if (this.elseCount_) {
                    container.setAttribute('else', 1);
                }
                return container;
            },
            domToMutation: function(xmlElement) {
                this.elseifCount_ = window.parseInt(xmlElement.getAttribute('elseif'), 10);
                this.elseCount_ = window.parseInt(xmlElement.getAttribute('else'), 10);
                for (var x = 1; x <= this.elseifCount_; x++) {
                    this.appendValueInput('IF' + x).setCheck(Boolean).appendField(new Blockly.FieldImage("img/blocks/decision_else.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                    this.appendStatementInput('DO' + x).appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom, 16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
                }
                if (this.elseCount_) {
					this.appendDummyInput('ELSE_LABEL').appendField(new Blockly.FieldImage("img/blocks/decision_end.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                    this.appendStatementInput('ELSE').appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom, 16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
                }
            },
            decompose: function(workspace) {
                var containerBlock = workspace.newBlock('controls_if_if');
                containerBlock.initSvg();
                var connection = containerBlock.getInput('STACK').connection;
                for (var x = 1; x <= this.elseifCount_; x++) {
                    var elseifBlock = workspace.newBlock('controls_if_elseif');
                    elseifBlock.initSvg();
                    connection.connect(elseifBlock.previousConnection);
                    connection = elseifBlock.nextConnection;
                }
                if (this.elseCount_) {
                    var elseBlock = workspace.newBlock('controls_if_else');
                    elseBlock.initSvg();
                    connection.connect(elseBlock.previousConnection);
                }
                return containerBlock;
            },
            compose: function(containerBlock) {
                if (this.elseCount_) {
					this.removeInput('ELSE_LABEL');
                    this.removeInput('ELSE');
                }
                this.elseCount_ = 0;
                for (var x = this.elseifCount_; x > 0; x--) {
                    this.removeInput('IF' + x);
                    this.removeInput('DO' + x);
                }
                this.elseifCount_ = 0;
                var clauseBlock = containerBlock.getInputTargetBlock('STACK');
                while (clauseBlock) {
                    switch (clauseBlock.type) {
                        case 'controls_if_elseif':
                            this.elseifCount_++;
                            var ifInput = this.appendValueInput('IF' + this.elseifCount_).setCheck(Boolean).appendField(new Blockly.FieldImage("img/blocks/decision_else.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                            var doInput = this.appendStatementInput('DO' + this.elseifCount_).setCheck('code');
                            doInput.appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom, 16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                            if (clauseBlock.valueConnection_) {
                                ifInput.connection.connect(clauseBlock.valueConnection_);
                            }
                            if (clauseBlock.statementConnection_) {
                                doInput.connection.connect(clauseBlock.statementConnection_);
                            }
                            break;
                        case 'controls_if_else':
                            this.elseCount_++;
							this.appendDummyInput('ELSE_LABEL').appendField(new Blockly.FieldImage("img/blocks/decision_end.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                            var elseInput = this.appendStatementInput('ELSE').setCheck('code');
                            elseInput.appendField(new Blockly.FieldImage("img/blocks/do.svg",16*options.zoom, 16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                            if (clauseBlock.statementConnection_) {
                                elseInput.connection.connect(clauseBlock.statementConnection_);
                            }
                            break;
                        default:
                            throw 'Unknown block type.';
                    }
                    clauseBlock = clauseBlock.nextConnection &&
                        clauseBlock.nextConnection.targetBlock();
                }
            },
            saveConnections: function(containerBlock) {
                var clauseBlock = containerBlock.getInputTargetBlock('STACK');
                var x = 1;
                while (clauseBlock) {
                    switch (clauseBlock.type) {
                        case 'controls_if_elseif':
                            var inputIf = this.getInput('IF' + x);
                            var inputDo = this.getInput('DO' + x);
                            clauseBlock.valueConnection_ =
                                inputIf && inputIf.connection.targetConnection;
                            clauseBlock.statementConnection_ =
                                inputDo && inputDo.connection.targetConnection;
                            x++;
                            break;
                        case 'controls_if_else':
                            inputDo = this.getInput('ELSE');
                            clauseBlock.statementConnection_ =
                                inputDo && inputDo.connection.targetConnection;
                            break;
                        default:
                            throw 'Unknown block type.';
                    }
                    clauseBlock = clauseBlock.nextConnection &&
                        clauseBlock.nextConnection.targetBlock();
                }
            }
        };

        Blockly.Blocks.controls_if_if = {
			colour: Facilino.LANG_COLOUR_CONTROL,
			keys: ['LANG_CONTROLS_IF_IF_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_CONTROL);
                this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/decision.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.appendStatementInput('STACK').setCheck('if');
                this.setTooltip(Facilino.locales.getKey('LANG_CONTROLS_IF_IF_TOOLTIP'));
                this.contextMenu = false;
            }
        };

        Blockly.Blocks.controls_if_elseif = {
			colour: Facilino.LANG_COLOUR_CONTROL,
			keys: ['LANG_CONTROLS_IF_ELSEIF_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_CONTROL);
                this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/decision_else.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.setPreviousStatement(true,'if');
                this.setNextStatement(true,'if');
                this.setTooltip(Facilino.locales.getKey('LANG_CONTROLS_IF_ELSEIF_TOOLTIP'));
                this.contextMenu = false;
            }
        };

        Blockly.Blocks.controls_if_else = {
            colour: Facilino.LANG_COLOUR_CONTROL,
			keys: ['LANG_CONTROLS_IF_ELSE_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_CONTROL);
                this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/decision_end.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.setPreviousStatement(true,'if');
                this.setTooltip(Facilino.locales.getKey('LANG_CONTROLS_IF_ELSE_TOOLTIP'));
                this.contextMenu = false;
            }
        };
		
		Blockly.Arduino.base_delay_msec = function() {
            var delay_time = Blockly.Arduino.valueToCode(this, 'DELAY_TIME', Blockly.Arduino.ORDER_ATOMIC);
            var code = '';
            var a = Facilino.findPinMode(delay_time);
            code += a['code'];
            delay_time = a['pin'];
			
			code += 'delay('+delay_time+');\n';
            return code;
        };

        Blockly.Blocks.base_delay_msec = {
            category: Facilino.locales.getKey('LANG_CATEGORY_CONTROLS'),
            category_colour: Facilino.LANG_COLOUR_CONTROL,
			colour: Facilino.LANG_COLOUR_CONTROL,
			keys: ['LANG_CONTROLS_BASE_DELAY_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_CONTROL);
                this.appendValueInput('DELAY_TIME', Number).appendField(new Blockly.FieldImage("img/blocks/wait.svg",20*options.zoom, 20*options.zoom)).setCheck(Number);
                this.setInputsInline(true);
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_CONTROLS_BASE_DELAY_TOOLTIP'));
            }
        };

        Blockly.Arduino.logic_boolean = function() {
            var code = (this.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
			return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

        Blockly.Blocks.logic_boolean = {
            category: Facilino.locales.getKey('LANG_CATEGORY_LOGIC'),
            category_colour: Facilino.LANG_COLOUR_LOGIC,	
			colour: Facilino.LANG_COLOUR_LOGIC,
			keys: ['LANG_LOGIC_BOOLEAN_TRUE','LANG_LOGIC_BOOLEAN_FALSE','LANG_LOGIC_BOOLEAN_TOOLTIP'],
			output: 'boolean',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_LOGIC);
                this.setOutput(true, Boolean);
                this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/binary.svg',20*options.zoom,20*options.zoom))
                    .appendField(new Blockly.FieldDropdown([
                        [Facilino.locales.getKey('LANG_LOGIC_BOOLEAN_TRUE'), 'TRUE'],
                        [Facilino.locales.getKey('LANG_LOGIC_BOOLEAN_FALSE'), 'FALSE']
                    ]), 'BOOL');
                this.setTooltip(Facilino.locales.getKey('LANG_LOGIC_BOOLEAN_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.logic_state = function() {
            var code = (this.getFieldValue('STATE') === 'HIGH') ? 'HIGH' : 'LOW';
			return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

        Blockly.Blocks.logic_state = {
            category: Facilino.locales.getKey('LANG_CATEGORY_LOGIC'),
            category_colour: Facilino.LANG_COLOUR_LOGIC,	
			colour: Facilino.LANG_COLOUR_LOGIC,
			keys: ['LANG_LOGIC_STATE_HIGH','LANG_LOGIC_STATE_LOW','LANG_LOGIC_STATE_TOOLTIP'],
			output: 'boolean',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_LOGIC);
                this.setOutput(true, Boolean);
                this.appendDummyInput('ENT').appendField(new Blockly.FieldImage('img/blocks/binary.svg',20*options.zoom,20*options.zoom))
                    .appendField(new Blockly.FieldDropdown([
                        [Facilino.locales.getKey('LANG_LOGIC_STATE_HIGH'), 'HIGH'],
                        [Facilino.locales.getKey('LANG_LOGIC_STATE_LOW'), 'LOW']
                    ]), 'STATE')
					. appendField(new Blockly.FieldImage('img/blocks/arrow_up.svg',20*options.zoom,20*options.zoom),'HIGH')
                this.setTooltip(Facilino.locales.getKey('LANG_LOGIC_STATE_TOOLTIP'));
				this.state=this.getFieldValue('STATE');
            },
			onchange: function()
			{
				if (this.state!==this.getFieldValue('STATE'))
				{
					//console.log('Cambio' + this.getFieldValue('STATE'));
					this.state=this.getFieldValue('STATE');
					ent=this.getInput('ENT');
					ent.removeField('HIGH');
					ent.removeField('LOW');
					if (this.state==='LOW')
					{
						ent.appendField(new Blockly.FieldImage('img/blocks/arrow_down.svg',20*options.zoom,20*options.zoom),'LOW')
					this.setTooltip(Facilino.locales.getKey('LANG_LOGIC_STATE_TOOLTIP'));
					}
					else
					{
						ent.appendField(new Blockly.FieldImage('img/blocks/arrow_up.svg',20*options.zoom,20*options.zoom),'HIGH')
					this.setTooltip(Facilino.locales.getKey('LANG_LOGIC_STATE_TOOLTIP'));
					}
					
				}
			}
        };
		
		Blockly.Arduino.logic_state_2 = function() {
            var code = (this.getFieldValue('STATE') === 'HIGH') ? 'HIGH' : 'LOW';
			return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

        Blockly.Blocks.logic_state_2 = {
            category: Facilino.locales.getKey('LANG_CATEGORY_LOGIC'),
            category_colour: Facilino.LANG_COLOUR_LOGIC,	
			colour: Facilino.LANG_COLOUR_LOGIC,
			keys: ['LANG_LOGIC_STATE_HIGH_2','LANG_LOGIC_STATE_LOW_2','LANG_LOGIC_STATE_TOOLTIP_2'],
			output: 'boolean',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_LOGIC);
                this.setOutput(true, Boolean);
                this.appendDummyInput('INPUT').appendField(new Blockly.FieldImage('img/blocks/binary.svg',20*options.zoom,20*options.zoom))
				.appendField(new Blockly.FieldDropdown([
                        [Facilino.locales.getKey('LANG_LOGIC_STATE_HIGH_2'), 'HIGH'],
                        [Facilino.locales.getKey('LANG_LOGIC_STATE_LOW_2'), 'LOW']
                    ]), 'STATE')
					.appendField(new Blockly.FieldImage('img/blocks/ON.svg',20*options.zoom,20*options.zoom),'LEFT')
                    .appendField(new Blockly.FieldImage('img/blocks/ARROW.svg',20*options.zoom,20*options.zoom),'ARROW')
					.appendField(new Blockly.FieldImage('img/blocks/OFF.svg',20*options.zoom,20*options.zoom),'RIGHT');
                this.setTooltip(Facilino.locales.getKey('LANG_LOGIC_STATE_TOOLTIP_2'));
				this.state=this.getFieldValue('STATE');
				
            },
			onchange: function()
			{
				if (this.state!==this.getFieldValue('STATE'))
				{
					//console.log('Cambio' + this.getFieldValue('STATE'));
					this.state=this.getFieldValue('STATE');
					var inp=this.getInput('INPUT');
					inp.removeField('LEFT');
					inp.removeField('ARROW');
					inp.removeField('RIGHT');
					if (this.state==='LOW')
					{
						inp.appendField(new Blockly.FieldImage('img/blocks/OFF.svg',20*options.zoom,20*options.zoom),'LEFT')
					.appendField(new Blockly.FieldImage('img/blocks/ARROW.svg',20*options.zoom,20*options.zoom),'ARROW')
					.appendField(new Blockly.FieldImage('img/blocks/ON.svg',20*options.zoom,20*options.zoom),'RIGHT');
					this.setTooltip(Facilino.locales.getKey('LANG_LOGIC_STATE_TOOLTIP_2'));
					}
					else
					{
						inp.appendField(new Blockly.FieldImage('img/blocks/ON.svg',20*options.zoom,20*options.zoom),'LEFT')
					.appendField(new Blockly.FieldImage('img/blocks/ARROW.svg',20*options.zoom,20*options.zoom),'ARROW')
					.appendField(new Blockly.FieldImage('img/blocks/OFF.svg',20*options.zoom,20*options.zoom),'RIGHT');
					this.setTooltip(Facilino.locales.getKey('LANG_LOGIC_STATE_TOOLTIP_2'));
					}
				}
			}
        };


        Blockly.Arduino.logic_compare = function() {
            var mode = this.getFieldValue('OP');
            var operator = Blockly.Arduino.logic_compare.OPERATORS[mode];
            var order = (operator === '==' || operator === '!=') ?
                Blockly.Arduino.ORDER_EQUALITY : Blockly.Arduino.ORDER_RELATIONAL;
            var argument0 = Blockly.Arduino.valueToCode(this, 'A', order) || '';
            var argument1 = Blockly.Arduino.valueToCode(this, 'B', order) || '';

            var code = '';

            var a = Facilino.findPinMode(argument0);
            code += a['code'];
            argument0 = a['pin'];

            a = Facilino.findPinMode(argument1);
            code += a['code'];
            argument1 = a['pin'];

            code += JST['logic_compare']({
                'argument0': argument0,
                'argument1': argument1,
                'operator': operator
            });

            return [code, order];
        };

        Blockly.Arduino.logic_compare.OPERATORS = {
            EQ: '==',
            NEQ: '!=',
            LT: '<',
            LTE: '<=',
            GT: '>',
            GTE: '>='
        };


        Blockly.Blocks.logic_compare = {
            category: Facilino.locales.getKey('LANG_CATEGORY_LOGIC'),
            category_colour: Facilino.LANG_COLOUR_LOGIC,		
			colour: Facilino.LANG_COLOUR_LOGIC,
			keys: ['LANG_LOGIC_COMPARE_TOOLTIP_EQ','LANG_LOGIC_COMPARE_TOOLTIP_NEQ','LANG_LOGIC_COMPARE_TOOLTIP_LT','LANG_LOGIC_COMPARE_TOOLTIP_LTE','LANG_LOGIC_COMPARE_TOOLTIP_GT','LANG_LOGIC_COMPARE_TOOLTIP_GTE'],
            output: 'boolean',
			init: function() {
                this.setColour(Facilino.LANG_COLOUR_LOGIC);
                this.setOutput(true, Boolean);
                this.appendValueInput('A').appendField(new Blockly.FieldImage('img/blocks/comparison.svg',48*options.zoom,20*options.zoom));
                this.appendValueInput('B').appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP');
                this.setInputsInline(true);
                // Assign 'this' to a variable for use in the tooltip closure below.
                var thisBlock = this;
                this.setTooltip(function() {
                    var op = thisBlock.getFieldValue('OP');
                    return Blockly.Blocks.logic_compare.TOOLTIPS[op];
                });
            }
        };

        Blockly.Blocks.logic_compare.OPERATORS = [
            ['=', 'EQ'],
            ['\u2260', 'NEQ'],
            ['<', 'LT'],
            ['\u2264', 'LTE'],
            ['>', 'GT'],
            ['\u2265', 'GTE']
        ];

        Blockly.Blocks.logic_compare.TOOLTIPS = {
            EQ: Facilino.locales.getKey('LANG_LOGIC_COMPARE_TOOLTIP_EQ'),
            NEQ: Facilino.locales.getKey('LANG_LOGIC_COMPARE_TOOLTIP_NEQ'),
            LT: Facilino.locales.getKey('LANG_LOGIC_COMPARE_TOOLTIP_LT'),
            LTE: Facilino.locales.getKey('LANG_LOGIC_COMPARE_TOOLTIP_LTE'),
            GT: Facilino.locales.getKey('LANG_LOGIC_COMPARE_TOOLTIP_GT'),
            GTE: Facilino.locales.getKey('LANG_LOGIC_COMPARE_TOOLTIP_GTE')
        };

        Blockly.Arduino.logic_operation = function() {
		    var code = '';
            var operator = (this.getFieldValue('OP') === 'AND') ? '&&' : (this.getFieldValue('OP') === 'OR') ? '||' : '';
            var order = (operator === '&&') ? Blockly.Arduino.ORDER_LOGICAL_AND : (operator === '||') ? Blockly.Arduino.ORDER_LOGICAL_OR : Blockly.Arduino.ORDER_NONE;
            var argument0 = Blockly.Arduino.valueToCode(this, 'A', order) || '';
            var argument1 = Blockly.Arduino.valueToCode(this, 'B', order) || '';
            var a = Facilino.findPinMode(argument0);
            code += a['code'];
            argument0 = a['pin'];
            a = Facilino.findPinMode(argument1);
            code += a['code'];
            argument1 = a['pin'];
			code += '(' + argument0 + ') ' + operator + ' (' + argument1 + ')';
            return [code, order];
        };
		
        Blockly.Blocks.logic_operation = {
            category: Facilino.locales.getKey('LANG_CATEGORY_LOGIC'),
            category_colour: Facilino.LANG_COLOUR_LOGIC,				
			colour: Facilino.LANG_COLOUR_LOGIC,
			keys: ['LANG_LOGIC_OPERATION_AND','LANG_LOGIC_OPERATION_OR','LANG_LOGIC_OPERATION_TOOLTIP_AND','LANG_LOGIC_OPERATION_TOOLTIP_OR'],
            output: 'boolean',
			init: function() {
                this.setColour(Facilino.LANG_COLOUR_LOGIC);
                this.setOutput(true, Boolean);
                this.appendValueInput('A').appendField(new Blockly.FieldImage('img/blocks/and.svg',20*options.zoom,20*options.zoom)).setCheck(Boolean);
                this.appendValueInput('B').setCheck(Boolean).appendField(new Blockly.FieldDropdown([
                    [Facilino.locales.getKey('LANG_LOGIC_OPERATION_AND') || 'AND', 'AND'],
                    [Facilino.locales.getKey('LANG_LOGIC_OPERATION_OR') || 'OR', 'OR']
                ]), 'OP');
                this.setInputsInline(true);
                var thisBlock = this;
                this.setTooltip(function() {
                    var op = thisBlock.getFieldValue('OP');
                    return Blockly.Blocks.logic_operation.TOOLTIPS[op];
                });
            }
        };
        Blockly.Blocks.logic_operation.TOOLTIPS = {
            AND: Facilino.locales.getKey('LANG_LOGIC_OPERATION_TOOLTIP_AND'),
            OR: Facilino.locales.getKey('LANG_LOGIC_OPERATION_TOOLTIP_OR')									  
        };
		
		
        Blockly.Arduino.logic_negate = function() {
            // Negation.
            var order = Blockly.Arduino.ORDER_UNARY_PREFIX;
            var argument0 = Blockly.Arduino.valueToCode(this, 'BOOL', order) || 'false';
            var code = '';
            var a = Facilino.findPinMode(argument0);
            code += a['code'];
            argument0 = a['pin'];

            code += JST['logic_negate']({
                'argument0': argument0
            });
			return [code, order];
        };


        Blockly.Blocks.logic_negate = {
            // Negation.
            category: Facilino.locales.getKey('LANG_CATEGORY_LOGIC'),
            category_colour: Facilino.LANG_COLOUR_LOGIC,	
			colour: Facilino.LANG_COLOUR_LOGIC,
			keys: ['LANG_LOGIC_NEGATE_TOOLTIP'],
			output: 'boolean',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_LOGIC);
                this.setOutput(true, Boolean);
                this.appendValueInput('BOOL').setCheck(Boolean).appendField(new Blockly.FieldImage('img/blocks/negation.svg',56*options.zoom,20*options.zoom));
                this.setTooltip(Facilino.locales.getKey('LANG_LOGIC_NEGATE_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.math_number = function() {
            // Numeric value.
            var code = window.parseFloat(this.getFieldValue('NUM'));
            var order = code < 0 ? Blockly.Arduino.ORDER_UNARY_PREFIX : Blockly.Arduino.ORDER_ATOMIC;
			return [code, order];
        };

        Blockly.Blocks.math_number = {
            // Numeric value.
            category: Facilino.locales.getKey('LANG_CATEGORY_MATH'), // Variables are handled specially.
            category_colour: Facilino.LANG_COLOUR_MATH,
			colour: Facilino.LANG_COLOUR_MATH,
			keys: ['LANG_MATH_NUMBER_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(this.colour);
                this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/numbers.svg',20*options.zoom,20*options.zoom))
				.appendField(new Blockly.FieldTextInput('0', Blockly.Blocks.math_number.validator), 'NUM');
                this.setOutput(true, Number);
                this.setTooltip(Facilino.locales.getKey('LANG_MATH_NUMBER_TOOLTIP'));
            }
        };
		
		 Blockly.Blocks.math_number.validator = function(text) {
            // Ensure that only a number may be entered.
            // TODO: Handle cases like 'o', 'ten', '1,234', '3,14', etc.
            var n = window.parseFloat(text || 0);
            return window.isNaN(n) ? null : String(n);
        };


        Blockly.Arduino.math_arithmetic = function() {
            var mode = this.getFieldValue('OP');
            var tuple = Blockly.Arduino.math_arithmetic.OPERATORS[mode];
            var operator = tuple[0];
            var order = tuple[1];
            var argument0 = Blockly.Arduino.valueToCode(this, 'A', order) || '';
            var argument1 = Blockly.Arduino.valueToCode(this, 'B', order) || '';
            var code = '';
            var a = Facilino.findPinMode(argument0);
            code += a['code'];
            argument0 = a['pin'];

            a = Facilino.findPinMode(argument1);
            code += a['code'];
            argument1 = a['pin'];
            code += JST['math_arithmetic']({
                'argument0': argument0,
                'argument1': argument1,
                'operator': operator
            });
            return [code, order];
        };

        Blockly.Arduino.math_arithmetic.OPERATORS = {
            ADD: [' + ', Blockly.Arduino.ORDER_ADDITIVE],
            MINUS: [' - ', Blockly.Arduino.ORDER_ADDITIVE],
            MULTIPLY: [' * ', Blockly.Arduino.ORDER_MULTIPLICATIVE],
            DIVIDE: [' / ', Blockly.Arduino.ORDER_MULTIPLICATIVE]
        };

        Blockly.Blocks.math_arithmetic = {
            category: Facilino.locales.getKey('LANG_CATEGORY_MATH'),
            category_colour: Facilino.LANG_COLOUR_MATH,
			colour: Facilino.LANG_COLOUR_MATH,
			keys: ['LANG_MATH_ARITHMETIC_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_MATH);
                this.setOutput(true, Number);
                this.appendValueInput('A').setCheck(Number).appendField(new Blockly.FieldImage('img/blocks/math.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.appendDummyInput('').appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP').setAlign(Blockly.ALIGN_RIGHT);
				this.appendValueInput('B').setCheck(Number).setAlign(Blockly.ALIGN_RIGHT);
				this.setInputsInline(true);
                var thisBlock = this;
                this.setTooltip(Facilino.locales.getKey('LANG_MATH_ARITHMETIC_TOOLTIP'));
            }
        };

        Blockly.Blocks.math_arithmetic.OPERATORS = [
            ['+', 'ADD'],
            ['-', 'MINUS'],
            ['\u00D7', 'MULTIPLY'],
            ['\u00F7', 'DIVIDE']
        ];
		
		Blockly.Arduino.base_map = function() {
            var value_num = Blockly.Arduino.valueToCode(this, 'NUM', Blockly.Arduino.ORDER_NONE);
			var value_dmin = Blockly.Arduino.valueToCode(this, 'DMIN', Blockly.Arduino.ORDER_ATOMIC);
            var value_dmax = Blockly.Arduino.valueToCode(this, 'DMAX', Blockly.Arduino.ORDER_ATOMIC);

            var code = '';
            var a = Facilino.findPinMode(value_num);
            code += a['code'];
            value_num = a['pin'];

            a = Facilino.findPinMode(value_dmax);
            code += a['code'];
            value_dmax = a['pin'];
			
			code += 'map('+value_num+',0,1023,'+value_dmin+','+value_dmax+')';

            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

        Blockly.Blocks.base_map = {
            category: Facilino.locales.getKey('LANG_CATEGORY_MATH'),
            category_colour: Facilino.LANG_COLOUR_MATH,
			colour: Facilino.LANG_COLOUR_MATH,
			keys: ['LANG_MATH_BASE_MAP_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_MATH);
                this.appendValueInput('NUM', Number).appendField(new Blockly.FieldImage('img/blocks/enlarge.svg',20*options.zoom,20*options.zoom)).setCheck(Number);
                this.appendValueInput('DMIN', Number).appendField(new Blockly.FieldImage('img/blocks/from2.svg',20*options.zoom,20*options.zoom)).setCheck(Number);
				this.appendValueInput('DMAX', Number).setCheck(Number);
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/to2.svg',20*options.zoom,20*options.zoom));
                this.setInputsInline(true);
                this.setOutput(true,Number);
                this.setTooltip(Facilino.locales.getKey('LANG_MATH_BASE_MAP_TOOLTIP'));
            }
        };
		
		
		Blockly.Arduino.math_minmax = function() {
            // Basic arithmetic operators, and power.
            var op = this.getFieldValue('OP');
            var argument0 = Blockly.Arduino.valueToCode(this, 'A', Blockly.Arduino.ORDER_NONE) || '';
            var argument1 = Blockly.Arduino.valueToCode(this, 'B', Blockly.Arduino.ORDER_NONE) || '';
            var code = '';
			code+= op+'('+argument0+','+argument1+')';
            
            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };
		
        Blockly.Blocks.math_minmax = {
            // Basic arithmetic operator.
            category: Facilino.locales.getKey('LANG_CATEGORY_MATH'),
            category_colour: Facilino.LANG_COLOUR_MATH,
			colour: Facilino.LANG_COLOUR_MATH,
			keys: ['LANG_MATH_MINMAX_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_MATH);
                this.setOutput(true, Number);
                this.appendValueInput('A').appendField(new Blockly.FieldImage('img/blocks/minmax.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldDropdown([['min', 'min'],['max', 'max']]), 'OP').appendField(new Blockly.FieldImage('img/blocks/one.svg',20*options.zoom,20*options.zoom)).setCheck(Number).setAlign(Blockly.ALIGN_RIGHT);
                this.appendValueInput('B').setCheck(Number).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/two.svg',20*options.zoom,20*options.zoom));
                this.appendDummyInput('');
				this.setInputsInline(true);
                var thisBlock = this;
                this.setTooltip(Facilino.locales.getKey('LANG_MATH_MINMAX_TOOLTIP'));
            }
        };
		
       
		
        Blockly.Arduino.math_random = function() {
            var value_num = Blockly.Arduino.valueToCode(this, 'NUM', Blockly.Arduino.ORDER_NONE);
            var value_dmax = Blockly.Arduino.valueToCode(this, 'DMAX', Blockly.Arduino.ORDER_ATOMIC);
            var code = '';
            var a = Facilino.findPinMode(value_num);
            code += a['code'];
            value_num = a['pin'];

            a = Facilino.findPinMode(value_dmax);
            code += a['code'];
            value_dmax = a['pin'];
			
			Blockly.Arduino.definitions_['define_random_bitOut'] = JST['math_random_bitOut']({});
			Blockly.Arduino.definitions_['define_random_seedOut'] = JST['math_random_seedOut']({});
			
			Blockly.Arduino.setups_['setup_randomseed'] = 'unsigned long seed =seedOut(31);\n  randomSeed(seed);\n';
			
            code += JST['math_random']({
                'value_num': value_num,
                'value_dmax': value_dmax
            });
            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

        Blockly.Blocks.math_random = {
            category: Facilino.locales.getKey('LANG_CATEGORY_MATH'),
            category_colour: Facilino.LANG_COLOUR_MATH,
			colour: Facilino.LANG_COLOUR_MATH,
			keys: ['LANG_ADVANCED_MATH_RANDOM_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(this.colour);
                this.appendValueInput('NUM', Number).appendField(new Blockly.FieldImage('img/blocks/dices.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/from2.svg',20*options.zoom,20*options.zoom)).setCheck(Number).setAlign(Blockly.ALIGN_RIGHT);
                this.appendValueInput('DMAX', Number).setAlign(Blockly.ALIGN_RIGHT).setCheck(Number);
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/to2.svg',20*options.zoom,20*options.zoom));
                this.setInputsInline(true);
                this.setOutput(true,Number);
                this.setTooltip(Facilino.locales.getKey('LANG_ADVANCED_MATH_RANDOM_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.variables_create = function() {
            var varType;
            var varValue = Blockly.Arduino.valueToCode(this, 'VALUE', Blockly.Arduino.ORDER_ASSIGNMENT);
			var input = this.getInputTargetBlock('VALUE');
			if (input===null)
				return '';
			var varName = this.getFieldValue('VAR') || '';
            var isFunction = false;
            for (var i in Blockly.Arduino.definitions_) {
                if (Blockly.Arduino.definitions_[i].search(varValue + ' \\(') >= 0) {
                    isFunction = true;
                    break;
                }
            }
            if (isFunction) {
                for (i in Blockly.Arduino.definitions_) {
                    if (Blockly.Arduino.definitions_[i].search(varValue) >= 0) {
                        if (Blockly.Arduino.definitions_[i].substring(0, 5) === 'float') {
                            varType = 'float';
                        }
						else if (Blockly.Arduino.definitions_[i].substring(0, 4) === 'bool') {
							varType = 'bool';
						}
						else if (Blockly.Arduino.definitions_[i].substring(0, 6) === 'String') {
                            varType = 'String';
                        } 
						else {
                            varType = '';
                        }
                        Blockly.Arduino.definitions_['declare_var' + varName] = varType + ' ' + varName + ';\n';
                        Blockly.Arduino.setups_['define_var' + varName] = varName + '=' + varValue + ';\n';
                        break;
                    }
                }
            } else if (this.isVariable(varValue)) {
                varType = Facilino.variables[varValue][0];
                Blockly.Arduino.definitions_['declare_var' + varName] = varType + ' ' + varName + ';\n';
                Blockly.Arduino.setups_['define_var' + varName] = varName + '=' + varValue + ';\n';
            } else if (input.output==='boolean') {
				varType = 'boolean';
				Blockly.Arduino.definitions_['declare_var' + varName] = varType + ' ' + varName + ';\n';
                Blockly.Arduino.setups_['define_var' + varName] = varName + '=' + varValue + ';\n';
            } else if (input.output==='number') {
                varType = 'float';
                Blockly.Arduino.definitions_['declare_var' + varName] = varType + ' ' + varName + ';\n';
                Blockly.Arduino.setups_['define_var' + varName] = varName + '=' + varValue + ';\n';
            }
			else if (input.output==='text')
			{
				varType = 'String';
                Blockly.Arduino.definitions_['declare_var' + varName] = varType + ' ' + varName + ';\n';
                Blockly.Arduino.setups_['define_var' + varName] = varName + '=' + varValue + ';\n';
			}
			Facilino.variables[varName] = [varType, 'global','variable'];
			return '';
        };
        Blockly.Blocks.variables_create = {
            category: Facilino.locales.getKey('LANG_CATEGORY_VARIABLES'), // Variables are handled specially.
            category_colour: Facilino.LANG_COLOUR_VARIABLES,
			colour: Facilino.LANG_COLOUR_VARIABLES,	
			keys: ['LANG_VARIABLES_GLOBAL_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_VARIABLES);
                this.appendValueInput('VALUE').appendField(new Blockly.FieldImage('img/blocks/box.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldTextInput(''), 'VAR');
                this.setInputsInline(false);
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_VARIABLES_GLOBAL_TOOLTIP'));
            },
            getVars: function() {
                return [this.getFieldValue('VAR')];
            },
            renameVar: function(oldName, newName) {
                if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
                    this.setFieldValue(newName, 'VAR');
                }
            },
            isVariable: function(varValue) {
                for (var i in Blockly.Variables.allVariables()) {
                    if (Blockly.Variables.allVariables()[i] === varValue) {
                        return true;
                    }
                }
                return false;
            },
            validName: function(name) {
                if (name && name.length > 0) {
                    var i = 0;
                    while (i < name.length) {
                        if (!isNaN(parseFloat(name[i]))) {
                            name = name.substring(1, name.length);
                        } else {
                            break;
                        }
                    }
                    name = name.replace(/([ ])/g, '_');
                    name = name.replace(/([áàâä])/g, 'a');
                    name = name.replace(/([éèêë])/g, 'e');
                    name = name.replace(/([íìîï])/g, 'i');
                    name = name.replace(/([óòôö])/g, 'o');
                    name = name.replace(/([úùûü])/g, 'u');
                    name = name.replace(/([ñ])/g, 'n');
                    name = name.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&\Ç\%\=\~\{\}\¿\¡\"\@\:\;\-\"\·\|\º\ª\¨\'\·\̣\─\ç\`\´\¨\^])/g, '');
                    i = 0;
                    while (i < name.length) {
                        if (!isNaN(parseFloat(name[i]))) {
                            name = name.substring(1, name.length);
                        } else {
                            break;
                        }
                    }
                    for (var j in Blockly.Arduino.RESERVED_WORDS_) {
                        var reserved_words = Blockly.Arduino.RESERVED_WORDS_.split(',');
                        if (name === reserved_words[j]) {
                            this.setWarningText('Reserved word');
                            name = '';
                            break;
                        } else {
                            this.setWarningText(null);
                        }
                    }
                }
                return name;
            },
            onchange: function() {
                if (this.last_variable !== this.getFieldValue('VAR')) {
                    var name = this.getFieldValue('VAR');
                    name = this.validName(name);
                    try {
                        this.setFieldValue(name, 'VAR');
                    } catch (e) {}
                    this.last_variable = name;
                }
            }
        };
		
		Blockly.Arduino.variables_get = function() {
            // Variable setter.
            var varName = this.getFieldValue('VAR') || '';
            if (Facilino.variables[this.getFieldValue('VAR')] !== undefined) {
                this.var_type = Facilino.variables[this.getFieldValue('VAR')][0];
            }
            return [varName, Blockly.Arduino.ORDER_ATOMIC];
        };
        Blockly.Blocks.variables_get = {
            // Variable setter.
            category: Facilino.locales.getKey('LANG_CATEGORY_VARIABLES'), // Variables are handled specially.
            category_colour: Facilino.LANG_COLOUR_VARIABLES,
			colour: Facilino.LANG_COLOUR_VARIABLES,	
			keys: ['LANG_VARIABLES_GET_TOOLTIP','LANG_CONTROLS_FOR_LOOP_WARNING5'],
			output: 'variable',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_VARIABLES);
                this.appendDummyInput('DUMMY').appendField(new Blockly.FieldImage('img/blocks/box_out.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldDropdown(this.getVariables()), 'VAR');
                this.setOutput(true);
                this.setTooltip(Facilino.locales.getKey('LANG_VARIABLES_GET_TOOLTIP'));
            },
            getVariables: function() {
				var variables = Blockly.Variables.allVariables();
				var dropdown = [];
                if (variables.length > 0) {
                    for (var i in variables) {
                        dropdown.push([variables[i], variables[i]]);
                    }
                } else {
                    dropdown.push(['', '']);
                }
                return dropdown;
            },
            onchange: function() {
                 if (!this.workspace) {
                     return;
                 }
				 var variables=Blockly.Variables.allVariables();
                 this.last_variable=this.getFieldValue('VAR');
                 if (!this.last_variables){
					 this.last_variables=[];
                 }
				 
				 for (var i=0;i<variables.length;i++){
					 if ((variables[i]!==this.last_variables[i])||(variables.length!==this.last_variables.length)){
						 this.getInput('DUMMY').removeField('VAR');
						 this.getInput('DUMMY').appendField(new Blockly.FieldDropdown(this.getVariables()), 'VAR');
                         this.setFieldValue(this.last_variable, 'VAR');
                         this.last_variables=variables;
                     }
                 }
                try {
                    if (!this.exists()) {
                        this.setWarningText(Facilino.locales.getKey('LANG_VARIABLES_CALL_WITHOUT_DEFINITION'));
                    } else {
						if (this.getFieldValue('VAR')==='iteration')
						{
							var in_for_loop=false;
							var block =this.getParent();
							while(block!==null)
							{
								if (block.type==='controls_for')
								{
									in_for_loop=true;
									break;
								}
								block=block.getParent();
							}
							if (in_for_loop)
								this.setWarningText(null);
							else
								this.setWarningText(Facilino.locales.getKey('LANG_CONTROLS_FOR_LOOP_WARNING5'));
						}
						else
                          this.setWarningText(null);
                    }
                } catch (e) {}
            },
            renameVar: function(oldName, newName) {
                if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
                    this.setTitleValue(newName, 'VAR');
                }
            },
            exists: function() {
				var variables = Blockly.Variables.allVariables();
                for (var i=0;i<variables.length;i++) {
                    if (variables[i] === this.getFieldValue('VAR')) {
                        return true;
                    }
                }
                return false;
            }
        };
		
		
		Blockly.Arduino.variables_set = function() {
            var varValue = Blockly.Arduino.valueToCode(this, 'VALUE', Blockly.Arduino.ORDER_ASSIGNMENT) || '';
            var varName = this.getFieldValue('VAR') || '';
            var code = '';
            code += JST['variables_set']({'varName': varName,'varValue': varValue});
            return code;
        };
        Blockly.Blocks.variables_set = {
            // Variable setter.
            category: Facilino.locales.getKey('LANG_CATEGORY_VARIABLES'),
            category_colour: Facilino.LANG_COLOUR_VARIABLES,
			colour: Facilino.LANG_COLOUR_VARIABLES,		
			keys: ['LANG_VARIABLES_SET_TOOLTIP','LANG_VARIABLES_CALL_WITHOUT_DEFINITION'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_VARIABLES);
                this.appendValueInput('VALUE').appendField(new Blockly.FieldImage('img/blocks/box_in.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldDropdown(this.getVariables()),'VAR').setAlign(Blockly.ALIGN_RIGHT);
                this.setInputsInline(false);
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_VARIABLES_SET_TOOLTIP'));
            },
            getVariables: function() {
                var variables = Blockly.Variables.allVariables();
				var dropdown = [];
                if (variables.length > 0) {
                    for (var i in variables) {
						if (variables[i]!=='iteration')
                          dropdown.push([variables[i], variables[i]]);
                    }
                } else {
                    dropdown.push(['', '']);
                }
				if (dropdown.length<1)
					dropdown.push(['', '']);
                return dropdown;
            },
            onchange: function() {
                if (!this.workspace) {
                    return;
                }
				this.last_field_value=this.getFieldValue('VAR');
                if (!this.last_variables){
                    this.last_variables=Blockly.Variables.allVariables();
                }
                var variables=Blockly.Variables.allVariables();
                for (var i in variables){
                     if (Blockly.Variables.allVariables()[i]!==this.last_variables[i]){
						 this.getInput('VALUE').removeField('VAR');
						 this.new_field=new Blockly.FieldDropdown(this.getVariables());
						 this.new_field.setValue(this.last_field_value);
						 this.getInput('VALUE').insertFieldAt(1,this.new_field,'VAR');
						 //this.getInput('VALUE').insertFieldAt(1,this.last_field,'VAR');
                         this.last_variables=Blockly.Variables.allVariables();
                     }
                 }
                try {
                    if (!this.exists()) {
                        this.setWarningText(Facilino.locales.getKey('LANG_VARIABLES_CALL_WITHOUT_DEFINITION'));
                    } else {
                        this.setWarningText(null);
                    }
                } catch (e) {}
            },
            renameVar: function(oldName, newName) {
                if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
                    this.setTitleValue(newName, 'VAR');
                }
            },
            exists: function() {
                for (var i in Blockly.Variables.allVariables()) {
                    if (Blockly.Variables.allVariables()[i] === this.getFieldValue('VAR')) {
                        return true;
                    }
                }
                return false;
            }
        };
		

        Blockly.Arduino.text = function() {
            var code = Blockly.Arduino.quote_(this.getFieldValue('TEXT'));
            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

        Blockly.Blocks.text = {
            category: Facilino.locales.getKey('LANG_CATEGORY_TEXT'),
            category_colour: Facilino.LANG_COLOUR_TEXT,
			colour: Facilino.LANG_COLOUR_TEXT,		
			keys: ['LANG_TEXT_TEXT_TOOLTIP'],
			output: 'text',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_TEXT);
                this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/text.svg',20*options.zoom,20*options.zoom))
                    .appendField('"')
                    .appendField(new Blockly.FieldTextInput(''), 'TEXT')
                    .appendField('"');
                this.setOutput(true, String);
                this.setTooltip(Facilino.locales.getKey('LANG_TEXT_TEXT_TOOLTIP'));
            }
        };

        Blockly.Arduino.text_join = function() {
            var code = '';
            var a;
            if (this.itemCount_ === 0) {
                return ['\'\'', Blockly.Arduino.ORDER_ATOMIC];
            } else if (this.itemCount_ === 1) {
                var argument0 = Blockly.Arduino.valueToCode(this, 'ADD0', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '';

                code += 'String(' + argument0 + ')';
                return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
            } else {
                var i = (Blockly.Arduino.valueToCode(this, 'ADD0', Blockly.Arduino.ORDER_NONE) || '');
                var final_line = 'String(' + i;
                for (var n = 1; n < this.itemCount_; n++) {
                    i = (Blockly.Arduino.valueToCode(this, 'ADD' + n, Blockly.Arduino.ORDER_NONE) || '');
                    final_line += ') + String(' + i;
                }
				code += final_line + ')';
                return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
            }
        };

        Blockly.Blocks.text_join = {
            category: Facilino.locales.getKey('LANG_CATEGORY_TEXT'),
			category_colour: Facilino.LANG_COLOUR_TEXT,
			colour: Facilino.LANG_COLOUR_TEXT,	
			keys: ['LANG_TEXT_JOIN_TOOLTIP'],
			output: 'text',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_TEXT);
                this.appendValueInput('ADD0').appendField(new Blockly.FieldImage('img/blocks/join.svg',20*options.zoom,16*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/text.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.appendValueInput('ADD1').appendField(new Blockly.FieldImage('img/blocks/text.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.setOutput(true, String);
                this.setMutator(new Blockly.Mutator(['text_create_join_item']));
                this.setTooltip(Facilino.locales.getKey('LANG_TEXT_JOIN_TOOLTIP'));
                this.itemCount_ = 2;
            },
            mutationToDom: function() {
                var container = document.createElement('mutation');
                container.setAttribute('items', this.itemCount_);
                return container;
            },
            domToMutation: function(xmlElement) {
                for (var x = 0; x < this.itemCount_; x++) {
                    this.removeInput('ADD' + x);
                }
                this.itemCount_ = window.parseInt(xmlElement.getAttribute('items'), 10);
                for (x = 0; x < this.itemCount_; x++) {
                    var input = this.appendValueInput('ADD' + x);
                    if (x === 0) {
                        input.appendField(new Blockly.FieldImage('img/blocks/join.svg',20*options.zoom,16*options.zoom));
                    }
					input.appendField(new Blockly.FieldImage('img/blocks/text.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                }
                if (this.itemCount_ === 0) {
                    this.appendDummyInput('EMPTY')
                        .appendField(new Blockly.FieldImage(Blockly.pathToBlockly +
                            'media/quote0.png', 12, 12))
                        .appendField(new Blockly.FieldImage(Blockly.pathToBlockly +
                            'media/quote1.png', 12, 12));
                }
            },
            decompose: function(workspace) {
                var containerBlock = workspace.newBlock('text_create_join_container');
                containerBlock.initSvg();
                var connection = containerBlock.getInput('STACK').connection;
                for (var x = 0; x < this.itemCount_; x++) {
                    var itemBlock = workspace.newBlock('text_create_join_item');
                    itemBlock.initSvg();
                    connection.connect(itemBlock.previousConnection);
                    connection = itemBlock.nextConnection;
                }
                return containerBlock;
            },
            compose: function(containerBlock) {
                if (this.itemCount_ === 0) {
                    this.removeInput('EMPTY');
                } else {
                    for (var x = this.itemCount_ - 1; x >= 0; x--) {
                        this.removeInput('ADD' + x);
                    }
                }
                this.itemCount_ = 0;
                var itemBlock = containerBlock.getInputTargetBlock('STACK');
                while (itemBlock) {
                    var input = this.appendValueInput('ADD' + this.itemCount_);
                    if (this.itemCount_ === 0) {
                        input.appendField(new Blockly.FieldImage('img/blocks/join.svg',20*options.zoom,16*options.zoom));
                    }
					input.appendField(new Blockly.FieldImage('img/blocks/text.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                    if (itemBlock.valueConnection_) {
                        input.connection.connect(itemBlock.valueConnection_);
                    }
                    this.itemCount_++;
                    itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
                }
                if (this.itemCount_ === 0) {
                    this.appendDummyInput('EMPTY')
                        .appendField(new Blockly.FieldImage(Blockly.pathToBlockly +
                            'media/quote0.png', 12, 12))
                        .appendField(new Blockly.FieldImage(Blockly.pathToBlockly +
                            'media/quote1.png', 12, 12));
                }
            },
            saveConnections: function(containerBlock) {
                var itemBlock = containerBlock.getInputTargetBlock('STACK');
                var x = 0;
                while (itemBlock) {
                    var input = this.getInput('ADD' + x);
                    itemBlock.valueConnection_ = input && input.connection.targetConnection;
                    x++;
                    itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
                }
            }
        };

        Blockly.Blocks.text_create_join_container = {
			colour: Facilino.LANG_COLOUR_TEXT,
			keys: ['LANG_TEXT_CREATE_JOIN_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_TEXT);
                this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/join.svg',20*options.zoom,16*options.zoom));
                this.appendStatementInput('STACK').setCheck('text_join');
                this.setTooltip(Facilino.locales.getKey('LANG_TEXT_CREATE_JOIN_TOOLTIP'));
                this.contextMenu = false;
            }
        };

        Blockly.Blocks.text_create_join_item = {
			colour: Facilino.LANG_COLOUR_TEXT,
			keys: ['LANG_TEXT_CREATE_JOIN_ITEM_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_TEXT);
                this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/text.svg',16*options.zoom,16*options.zoom));
                this.setPreviousStatement(true,'text_join');
                this.setNextStatement(true,'text_join');
                this.setTooltip(Facilino.locales.getKey('LANG_TEXT_CREATE_JOIN_ITEM_TOOLTIP'));
                this.contextMenu = false;
            }
        };

        Blockly.Arduino.text_length = function() {
            var argument0 = Blockly.Arduino.valueToCode(this, 'VALUE', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '';
            var code = '';
            code += JST['text_length']({'argument0': argument0});
            return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
        };

        Blockly.Blocks.text_length = {
            // String length.
            category: Facilino.locales.getKey('LANG_CATEGORY_TEXT'),
            category_colour: Facilino.LANG_COLOUR_TEXT,
			colour: Facilino.LANG_COLOUR_TEXT,
			keys: ['LANG_TEXT_LENGTH_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_TEXT);
                this.appendValueInput('VALUE').setCheck([String]).appendField(new Blockly.FieldImage('img/blocks/length.svg',32*options.zoom,20*options.zoom));
                this.setOutput(true, Number);
                this.setTooltip(Facilino.locales.getKey('LANG_TEXT_LENGTH_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.text_equalsIgnoreCase = function() {
            var string1 = Blockly.Arduino.valueToCode(this, 'STRING1', Blockly.Arduino.ORDER_NONE);
            string1 = string1.replace(/&quot;/g, '"');
            var string2 = Blockly.Arduino.valueToCode(this, 'STRING2', Blockly.Arduino.ORDER_NONE);
            string2 = string2.replace(/&quot;/g, '"');
            var code = '';
            code += JST['text_equalsIgnoreCase']({
                'string1': string1,
                'string2': string2
            });

            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

        Blockly.Blocks.text_equalsIgnoreCase = {
            category: Facilino.locales.getKey('LANG_CATEGORY_TEXT'),
            category_colour: Facilino.LANG_COLOUR_TEXT,
			colour: Facilino.LANG_COLOUR_TEXT,	
			keys: ['LANG_TEXT_EQUALSIGNORECASE_TOOLTIP'],
			output: 'boolean',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_TEXT);
                this.appendValueInput('STRING1').appendField(new Blockly.FieldImage('img/blocks/text_equal.svg',32*options.zoom,20*options.zoom));
                this.appendValueInput('STRING2').appendField('=').setAlign(Blockly.ALIGN_RIGHT);
                this.setInputsInline(true);
                this.setOutput(true,Boolean);
                this.setTooltip(Facilino.locales.getKey('LANG_TEXT_EQUALSIGNORECASE_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.text_lower = function() {
            var argument0 = Blockly.Arduino.valueToCode(this, 'VALUE', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '';
            var code = '';
            code += JST['text_lower']({'argument0': argument0});
            return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
        };

        Blockly.Blocks.text_lower = {
            // String length.
            category: Facilino.locales.getKey('LANG_CATEGORY_TEXT'),
            category_colour: Facilino.LANG_COLOUR_TEXT,
			colour: Facilino.LANG_COLOUR_TEXT,
			keys: ['LANG_TEXT_LENGTH_LOWER_TOOLTIP'],
			output: 'text',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_TEXT);
                this.appendValueInput('VALUE').setCheck(String).appendField(new Blockly.FieldImage('img/blocks/upper2lower.svg',32*options.zoom,20*options.zoom));
                this.setOutput(true, String);
                this.setTooltip(Facilino.locales.getKey('LANG_TEXT_LENGTH_LOWER_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.text_upper = function() {
            var argument0 = Blockly.Arduino.valueToCode(this, 'VALUE', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '';
            var code = '';
            code += JST['text_upper']({'argument0': argument0});
            return [code, Blockly.Arduino.ORDER_UNARY_POSTFIX];
        };

        Blockly.Blocks.text_upper = {
            // String length.
            category: Facilino.locales.getKey('LANG_CATEGORY_TEXT'),
            category_colour: Facilino.LANG_COLOUR_TEXT,
			colour: Facilino.LANG_COLOUR_TEXT,
			keys: ['LANG_TEXT_LENGTH_UPPER_TOOLTIP'],
			output: 'text',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_TEXT);
                this.appendValueInput('VALUE').setCheck(String).appendField(new Blockly.FieldImage('img/blocks/lower2upper.svg',32*options.zoom,20*options.zoom));
                this.setOutput(true, String);
                this.setTooltip(Facilino.locales.getKey('LANG_TEXT_LENGTH_UPPER_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.text_to_number = function() {
            var str = Blockly.Arduino.valueToCode(this,'STRING', Blockly.Arduino.ORDER_NONE);
			var code='';
			code = str+'.toFloat()';
            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

        Blockly.Blocks.text_to_number = {
            category: Facilino.locales.getKey('LANG_CATEGORY_TEXT'),
			category_colour: Facilino.LANG_COLOUR_TEXT,
			colour: Facilino.LANG_COLOUR_TEXT,	
			keys: ['LANG_TEXT_NUMBER_CAST_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_TEXT);
                this.appendValueInput('STRING').appendField(new Blockly.FieldImage('img/blocks/tonumber.svg',64*options.zoom,20*options.zoom));
                this.setOutput(true);
                this.setTooltip(Facilino.locales.getKey('LANG_TEXT_NUMBER_CAST_TOOLTIP'));
            }
        };


			
			Blockly.Arduino.inout_analog_read = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            Blockly.Arduino.setups_['setup_analog_read' + dropdown_pin] = JST['inout_analog_read_setups']({'dropdown_pin': dropdown_pin});
            code += JST['inout_analog_read']({'dropdown_pin': dropdown_pin});
            return [code, Blockly.Arduino.ORDER_ATOMIC];
			};

        Blockly.Blocks.inout_analog_read = {
            category: Facilino.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: Facilino.LANG_COLOUR_ADVANCED,
			colour: Facilino.LANG_COLOUR_ADVANCED,
			keys: ['LANG_ADVANCED_INOUT_ANALOG_READ_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('PIN').appendField(new Blockly.FieldImage('img/blocks/read.svg',20*options.zoom,20*options.zoom))
					.appendField(new Blockly.FieldImage("img/blocks/analog_signal.svg",20*options.zoom, 20*options.zoom))
					.appendField(new Blockly.FieldDropdown(profiles.default.analog),'PIN');
                this.setOutput(true, Number);
                this.setInputsInline(true);
                this.setTooltip(Facilino.locales.getKey('LANG_ADVANCED_INOUT_ANALOG_READ_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.inout_digital_read = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            Blockly.Arduino.setups_['setup_green_digital_read' + dropdown_pin] = JST['inout_digital_read_setups']({'dropdown_pin': dropdown_pin});
            code += JST['inout_digital_read']({'dropdown_pin': dropdown_pin});
            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

        Blockly.Blocks.inout_digital_read = {
            category: Facilino.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: Facilino.LANG_COLOUR_ADVANCED,
			colour: Facilino.LANG_COLOUR_ADVANCED,
			keys: ['LANG_ADVANCED_INOUT_DIGITAL_READ_TOOLTIP'],
			output: 'boolean',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('PIN').appendField(new Blockly.FieldImage('img/blocks/read.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.setOutput(true, Boolean);
                this.setInputsInline(true);
                this.setTooltip(Facilino.locales.getKey('LANG_ADVANCED_INOUT_DIGITAL_READ_TOOLTIP'));
            }
        };
	
        Blockly.Arduino.inout_analog_write = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var value_num = Blockly.Arduino.valueToCode(this, 'NUM', Blockly.Arduino.ORDER_ATOMIC);
            var code = '';
			Blockly.Arduino.setups_['setup_analog_write' + dropdown_pin] = JST['inout_analog_write_setups']({'dropdown_pin': dropdown_pin,'value_num': value_num});
            code += JST['inout_analog_write']({'dropdown_pin': dropdown_pin,'value_num': value_num});
            return code;
        };
		
		
        Blockly.Blocks.inout_analog_write = {
            category: Facilino.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: Facilino.LANG_COLOUR_ADVANCED,
			colour: Facilino.LANG_COLOUR_ADVANCED,
			keys: ['LANG_ADVANCED_INOUT_ANALOG_WRITE_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/write.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/pwm_signal.svg",20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldDropdown(profiles.default.pwm),'PIN');
                this.appendValueInput('NUM', Number).appendField(new Blockly.FieldImage("img/blocks/byte.svg",20*options.zoom, 20*options.zoom)).setCheck(Number);
                this.setInputsInline(true);
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_ADVANCED_INOUT_ANALOG_WRITE_TOOLTIP'));
            }
        };
		
        Blockly.Arduino.inout_digital_write = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var dropdown_stat = Blockly.Arduino.valueToCode(this, 'STAT', Blockly.Arduino.ORDER_ATOMIC);
            var code = '';
            Blockly.Arduino.setups_['setup_digital_write_' + dropdown_pin] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pin});
            code += JST['inout_digital_write']({'dropdown_pin': dropdown_pin,'dropdown_stat': dropdown_stat});
            return code;
        };

        Blockly.Blocks.inout_digital_write = {
            category: Facilino.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: Facilino.LANG_COLOUR_ADVANCED,
			colour: Facilino.LANG_COLOUR_ADVANCED,
			keys: ['LANG_ADVANCED_INOUT_DIGITAL_WRITE_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/write.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.appendValueInput('STAT').appendField(new Blockly.FieldImage('img/blocks/binary.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.setPreviousStatement(true,'code');
                this.setInputsInline(true);
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_ADVANCED_INOUT_DIGITAL_WRITE_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.inout_builtin_led = function() {
            var dropdown_stat = this.getFieldValue('STAT');
			var code = '';
            Blockly.Arduino.setups_['setup_green_led_13'] = JST['inout_builtin_led_setups']({});
			if (dropdown_stat==='TOGGLE')
			  code +='digitalWrite(13,!digitalRead(13));\n';
			else
			  code = JST['inout_builtin_led']({'dropdown_stat': dropdown_stat});

            return code;
        };
        Blockly.Blocks.inout_builtin_led = {
            category: Facilino.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: Facilino.LANG_COLOUR_ADVANCED,
			colour: Facilino.LANG_COLOUR_ADVANCED,
			keys: ['LANG_ADVANCED_BUILTIN_LED_ON','LANG_ADVANCED_BUILTIN_LED_OFF','LANG_ADVANCED_BUILTIN_LED_TOGGLE','LANG_ADVANCED_BUILTIN_LED_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('')
                    .appendField(new Blockly.FieldImage("img/blocks/diode_led.svg",20*options.zoom, 20*options.zoom))
                    .appendField(new Blockly.FieldDropdown([
                        [Facilino.locales.getKey('LANG_ADVANCED_BUILTIN_LED_ON') || 'ON', 'HIGH'],
                        [Facilino.locales.getKey('LANG_ADVANCED_BUILTIN_LED_OFF') || 'OFF', 'LOW'],
                        [Facilino.locales.getKey('LANG_ADVANCED_BUILTIN_LED_TOGGLE') || 'TOGGLE', 'TOGGLE']																											 
                    ]), 'STAT');
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_ADVANCED_BUILTIN_LED_TOOLTIP'));
            }
        };

		
		Blockly.Arduino.serial_println = function() {
            var content = Blockly.Arduino.valueToCode(this, 'CONTENT', Blockly.Arduino.ORDER_ATOMIC);
            var code = '';
            Blockly.Arduino.setups_['setup_serial'] = JST['serial_setups']({'bitrate': profiles.default.serial});
            code += 'Serial.println(' + content+');\n';
            return code;
        };

        Blockly.Blocks.serial_println = {
            category: Facilino.locales.getKey('LANG_CATEGORY_COMMUNICATION'),
            category_colour: Facilino.LANG_COLOUR_COMMUNICATION,
			colour: Facilino.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_ADVANCED_SERIAL_PRINTLN_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_COMMUNICATION);
                this.appendValueInput('CONTENT', String).appendField(new Blockly.FieldImage('img/blocks/usb.svg',12*options.zoom, 12*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/printer.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/text.svg',20*options.zoom, 20*options.zoom));
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_ADVANCED_SERIAL_PRINTLN_TOOLTIP'));
            }
        };

        Blockly.Arduino.serial_available = function() {
            var branch = Blockly.Arduino.statementToCode(this, 'DO');
            branch = branch.replace(/&quot;/g, '"');
            Blockly.Arduino.setups_['setup_serial'] = JST['serial_setups']({
			'bitrate': profiles.default.serial
            });
            var code = JST['serial_available']({
                'branch': branch
            });
            return code;
        };

        Blockly.Blocks.serial_available = {
            category: Facilino.locales.getKey('LANG_CATEGORY_COMMUNICATION'),
            category_colour: Facilino.LANG_COLOUR_COMMUNICATION,
			colour: Facilino.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_ADVANCED_SERIAL_AVAILABLE_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/.svg',12*options.zoom, 12*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/inbox.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/available.svg',20*options.zoom, 20*options.zoom));
                this.appendStatementInput('DO').appendField(new Blockly.FieldImage('img/blocks/do.svg', 16*options.zoom, 16*options.zoom));
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_ADVANCED_SERIAL_AVAILABLE_TOOLTIP'));
            }
        };
		
        Blockly.Arduino.serial_parsefloat = function() {
            Blockly.Arduino.setups_['setup_serial'] = JST['serial_setups']({
                'bitrate': profiles.default.serial
            });
            var code = 'Serial.parseFloat()';

            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

        Blockly.Blocks.serial_parsefloat = {
            category: Facilino.locales.getKey('LANG_CATEGORY_COMMUNICATION'),
            category_colour: Facilino.LANG_COLOUR_COMMUNICATION,
			colour: Facilino.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_ADVANCED_SERIAL_PARSE_NUMBER_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/usb.svg',12*options.zoom, 12*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/inbox.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/numbers.svg',20*options.zoom, 20*options.zoom));
                this.setOutput(true, Number);
                this.setTooltip(Facilino.locales.getKey('LANG_ADVANCED_SERIAL_PARSE_NUMBER_TOOLTIP'));
            }
        };

		Blockly.Arduino.relay_write = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var dropdown_stat = Blockly.Arduino.valueToCode(this, 'STAT', Blockly.Arduino.ORDER_ATOMIC);
            var code = '';
            Blockly.Arduino.setups_['setup_digital_write_' + dropdown_pin] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pin});
            code += JST['inout_digital_write']({'dropdown_pin': dropdown_pin,'dropdown_stat': dropdown_stat});
            return code;
        };

        Blockly.Blocks.relay_write = {
            category: Facilino.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: Facilino.LANG_COLOUR_ADVANCED,
			colour: Facilino.LANG_COLOUR_ADVANCED,
			keys: ['LANG_RELAY_WRITE_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/relay.svg',20*options.zoom, 20*options.zoom))
					.appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom, 20*options.zoom))
					.appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.appendValueInput('STAT').appendField(new Blockly.FieldImage('img/blocks/binary.svg',20*options.zoom,20*options.zoom))
					.setAlign(Blockly.ALIGN_RIGHT);
                this.setPreviousStatement(true,'code');
                this.setInputsInline(true);
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_RELAY_WRITE_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.relay_write_2 = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var dropdown_stat = (this.getFieldValue('STATE') === 'HIGH') ? 'HIGH' : 'LOW';
            var code = '';
            Blockly.Arduino.setups_['setup_digital_write_' + dropdown_pin] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pin});
            code += JST['inout_digital_write']({'dropdown_pin': dropdown_pin,'dropdown_stat':dropdown_stat });
            return code;
        };

        Blockly.Blocks.relay_write_2 = {
            category: Facilino.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: Facilino.LANG_COLOUR_ADVANCED,
			colour: Facilino.LANG_COLOUR_ADVANCED,
			keys: ['LANG_RELAY_WRITE_TOOLTIP', 'LANG_LOGIC_STATE_HIGH_2', 'LANG_LOGIC_STATE_LOW_2', 'LANG_LOGIC_STATE_TOOLTIP_2'  ],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/relay.svg',30*options.zoom,20*options.zoom))
					.appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT)
					.appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/binary.svg',20*options.zoom,20*options.zoom))
				this.appendDummyInput('ENT').appendField(new Blockly.FieldDropdown([
                        [Facilino.locales.getKey('LANG_LOGIC_STATE_HIGH_2'), 'HIGH'],
                        [Facilino.locales.getKey('LANG_LOGIC_STATE_LOW_2'), 'LOW']
                    ]), 'STATE')
				//this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/ON.svg',20*options.zoom,20*options.zoom),'HIGH')
                
                this.setPreviousStatement(true,'code');
                this.setInputsInline(true);
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_RELAY_WRITE_TOOLTIP'));
			},
				onchange: function()
				{
					if (this.state!==this.getFieldValue('STATE'))
					{
						//console.log('Cambio' + this.getFieldValue('STATE'));
						this.state=this.getFieldValue('STATE');
						ent=this.getInput('ENT');
						ent.removeField('HIGH');
						ent.removeField('LOW');
						if (this.state==='LOW')
						{
							ent.appendField(new Blockly.FieldImage('img/blocks/OFF.svg',20*options.zoom,20*options.zoom),'LOW')
						this.setTooltip(Facilino.locales.getKey('LANG_LOGIC_STATE_TOOLTIP'));
						}
						else
						{
							ent.appendField(new Blockly.FieldImage('img/blocks/ON.svg',20*options.zoom,20*options.zoom),'HIGH')
						this.setTooltip(Facilino.locales.getKey('LANG_LOGIC_STATE_TOOLTIP'));
						}
						
					}
				}
            
        };
		
		
        Blockly.Arduino.serial_readstring = function() {

            Blockly.Arduino.setups_['setup_serial'] = JST['serial_setups']({
                'bitrate': profiles.default.serial
            });
            var code = 'Serial.readString()';

            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

        Blockly.Blocks.serial_readstring = {
            category: Facilino.locales.getKey('LANG_CATEGORY_COMMUNICATION'),
            category_colour: Facilino.LANG_COLOUR_COMMUNICATION,
			colour: Facilino.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_ADVANCED_SERIAL_READSTRING_TOOLTIP'],
			output: 'text',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/usb.svg',12*options.zoom, 12*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/inbox.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/text.svg',20*options.zoom, 20*options.zoom));
                this.setOutput(true, String);
                this.setTooltip(Facilino.locales.getKey('LANG_ADVANCED_SERIAL_READSTRING_TOOLTIP'));
            }
        };
        
		
        Blockly.Arduino.button = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            Blockly.Arduino.setups_['setup_button_' + dropdown_pin] = 'pinMode(' +dropdown_pin+',INPUT);\n';
            code += 'digitalRead('+dropdown_pin+')';
            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

        Blockly.Blocks.button = {
            category: Facilino.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: Facilino.LANG_COLOUR_ADVANCED,
			colour: Facilino.LANG_COLOUR_ADVANCED,
			keys: ['LANG_BQ_BUTTON_TOOLTIP'],
			output: 'boolean',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/pushbutton.svg', 20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg', 20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.setOutput(true, Boolean);
                this.setTooltip(Facilino.locales.getKey('LANG_BQ_BUTTON_TOOLTIP'));
            }
        };

        Blockly.Arduino.button_case = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            Blockly.Arduino.setups_['setup_button_' + dropdown_pin] = 'pinMode(' +dropdown_pin+',INPUT);\n';
			var code_pressed = '';
			var code_not_pressed = '';
			code_pressed += Blockly.Arduino.statementToCode(this, 'PRESSED');
			code_not_pressed += Blockly.Arduino.statementToCode(this, 'NOT_PRESSED');
			code_pressed = code_pressed.replace(/&quot;/g, '"');
			code_not_pressed = code_not_pressed.replace(/&quot;/g, '"');

            code += 'if ('+'digitalRead(' +dropdown_pin+')==LOW){\n'+code_pressed+'\n}\nelse{\n'+code_not_pressed+'\n}\n';
            return code;
        };
        Blockly.Blocks.button_case = {
            category: Facilino.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: Facilino.LANG_COLOUR_ADVANCED,
			colour: Facilino.LANG_COLOUR_ADVANCED,
			keys: ['LANG_BQ_BUTTON_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/pushbutton.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg', 20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.appendStatementInput('PRESSED').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/pushbutton_pressed.svg',20*options.zoom, 20*options.zoom));
                this.appendStatementInput('NOT_PRESSED').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/pushbutton_release.svg',20*options.zoom, 20*options.zoom));
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_BQ_BUTTON_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.button_long_short = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            Blockly.Arduino.setups_['setup_button_' + dropdown_pin] = 'pinMode(' +dropdown_pin+',INPUT);\n';
			Blockly.Arduino.definitions_['declare_var_button_active_'+dropdown_pin]='boolean _buttonActive_'+dropdown_pin+'=false;\n';
			Blockly.Arduino.definitions_['declare_var_long_press_active_'+dropdown_pin]='boolean _longPressActive_'+dropdown_pin+'=false;\n';
			Blockly.Arduino.definitions_['declare_var_button_timer_'+dropdown_pin]='long _buttonTimer_'+dropdown_pin+'=0;\n';	

			var code_long_pressed = '';
			var code_short_pressed = '';
			code_long_pressed += Blockly.Arduino.statementToCode(this, 'LONG_PRESSED');
			code_short_pressed += Blockly.Arduino.statementToCode(this, 'SHORT_PRESSED');

			code_long_pressed = code_long_pressed.replace(/&quot;/g, '"');
			code_short_pressed = code_short_pressed.replace(/&quot;/g, '"');

			code+='if (digitalRead('+dropdown_pin+')==LOW) {\n    if (_buttonActive_'+dropdown_pin+'==false) {\n      _buttonActive_'+dropdown_pin+'=true;\n      _buttonTimer_'+dropdown_pin+'=millis();\n    }\n    if ((millis()-_buttonTimer_'+dropdown_pin+'>1000)&&(_longPressActive_'+dropdown_pin+'==false)){\n      _longPressActive_'+dropdown_pin+'=true;\n'+code_long_pressed+'\n}\n  }\n else {\n    if (_buttonActive_'+dropdown_pin+'== true){\n      if (_longPressActive_'+dropdown_pin+'==true){\n        _longPressActive_'+dropdown_pin+'=false;\n      }\n else  if (millis()-_buttonTimer_'+dropdown_pin+'>100){\n'+code_short_pressed+'\n}\n      _buttonActive_'+dropdown_pin+'=false;\n    }\n  }\n';
			return code;
        };
        Blockly.Blocks.button_long_short = {
            category: Facilino.locales.getKey('LANG_CATEGORY_ADVANCED'),
            category_colour: Facilino.LANG_COLOUR_ADVANCED,
			colour: Facilino.LANG_COLOUR_ADVANCED,
			keys: ['LANG_BQ_BUTTON_LONG_SHORT_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_ADVANCED);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/pushbutton.svg', 20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg', 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.appendStatementInput('LONG_PRESSED').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/cursor.svg', 20*options.zoom, 20*options.zoom));
                this.appendStatementInput('SHORT_PRESSED').setAlign(Blockly.ALIGN_RIGHT).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/cursor1.svg', 20*options.zoom, 20*options.zoom));
                this.setPreviousStatement(true,'code');
				this.setInputsInline(false);
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_BQ_BUTTON_LONG_SHORT_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.bluetooth_def = function() {
            var dropdown_pin, NextPIN;
            
            dropdown_pin =this.getFieldValue('PIN');
            NextPIN = this.getFieldValue('PIN2');
            var a = Facilino.findPinMode(dropdown_pin);
            Blockly.Arduino.setups_['setup_softwareserial_pinmode'] = a['code'];
            dropdown_pin = a['pin'];
            a = Facilino.findPinMode(NextPIN);
            Blockly.Arduino.setups_['setup_softwareserial_pinmode2'] = a['code'];
            NextPIN = a['pin'];
            var baud_rate = 9600;
			Blockly.Arduino.definitions_['declare_var_SoftwareSerial' + dropdown_pin] = 'SoftwareSerial _bt_softwareSerial(' + dropdown_pin + ',' + NextPIN + ');\n';
            Blockly.Arduino.definitions_['define_softwareserial'] = JST['softwareserial_def_definitions']({});
			Blockly.Arduino.setups_['setup_softwareserial_'] = JST['bt_softwareserial_def_setups']({'baud_rate': baud_rate});
            return '';
        };
		
        Blockly.Blocks.bluetooth_def = {
            category: Facilino.locales.getKey('LANG_CATEGORY_COMMUNICATION'),
            category_colour: Facilino.LANG_COLOUR_COMMUNICATION,
			colour: Facilino.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_BLUETOOTH_DEF_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/bluetooth.svg',12*options.zoom, 12*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/setup.svg', 20*options.zoom, 20*options.zoom));
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/rx.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/tx.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg", 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN2');
				this.setFieldValue('3','PIN2');
				this.setInputsInline(true);
                this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_BLUETOOTH_DEF_TOOLTIP'));
            }
        };

    Blockly.Arduino.bluetooth_app = function()
	{
            var n = 1;
            var argument, branch, case2_argument,case2_code;
            var code = 'if (_bt_softwareSerial.available()>0)\n{\n';
        code += '  int cmd=_bt_softwareSerial.read();\n';
        for (n = 1; n <= this.itemCount_; n++) {
            argument = Blockly.Arduino.valueToCode(this, 'DATA' + n, Blockly.Arduino.ORDER_NONE);
			branch = Blockly.Arduino.statementToCode(this, 'ITEM' + n);
            branch = indentSentences(branch);
            branch = branch.substring(0, branch.length - 1);
            code += '     \n  if (cmd=='+argument+'){\n    _bt_cmd=0;\n'+branch+'  }';
        }
        return code+'\n}\n';
        };

        Blockly.Blocks.bluetooth_app = {
            category: Facilino.locales.getKey('LANG_CATEGORY_COMMUNICATION'),
            category_colour: Facilino.LANG_COLOUR_COMMUNICATION,
			colour: Facilino.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_BLUETOOTH_APP_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput().appendField(new Blockly.FieldImage('img/blocks/bluetooth.svg',12*options.zoom, 12*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/inbox.svg',20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/smartphoneC.svg", 20*options.zoom, 20*options.zoom));
				this.setMutator(new Blockly.Mutator(['bluetooth_app_item']));
				this.itemCount_ = 0;
				this.setInputsInline(false);
				this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_BLUETOOTH_APP_TOOLTIP'));
            },
			mutationToDom: function() {
                if (!this.itemCount_ ) {
                    return null;
                }
                var container = document.createElement('mutation');
                if (this.itemCount_) {
                    container.setAttribute('item', this.itemCount_);
                }
                return container;
            },
            domToMutation: function(xmlElement) {
                this.itemCount_ = window.parseInt(xmlElement.getAttribute('item'), 10);
                for (var x = 1; x <= this.itemCount_; x++) {
					this.appendValueInput('DATA' + x).setCheck(Number).appendField(new Blockly.FieldImage("img/blocks/byte.svg", 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                    this.setInputsInline(false);
					this.appendStatementInput('ITEM' + x).appendField(new Blockly.FieldImage('img/blocks/do.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
                }
            },
            decompose: function(workspace) {
                var containerBlock = workspace.newBlock('bluetooth_app_app');
                containerBlock.initSvg();
                var connection = containerBlock.getInput('STACK').connection;
                for (var x = 1; x <= this.itemCount_; x++) {
                    var itemBlock = workspace.newBlock('bluetooth_app_item');
                    itemBlock.initSvg();
                    connection.connect(itemBlock.previousConnection);
                    connection = itemBlock.nextConnection;
                }
                return containerBlock;
            },
            compose: function(containerBlock) {
                for (var x = this.itemCount_; x > 0; x--) {
                    this.removeInput('DATA' + x);
                    this.removeInput('ITEM' + x);
                }
                this.itemCount_ = 0;
                // Rebuild the block's optional inputs.
                var clauseBlock = containerBlock.getInputTargetBlock('STACK');
                while (clauseBlock) {
                    switch (clauseBlock.type) {
                        case 'bluetooth_app_item':
                            this.itemCount_++;
							this.setInputsInline(false);
                            var dataInput = this.appendValueInput('DATA' + this.itemCount_).setCheck(Number).appendField(new Blockly.FieldImage("img/blocks/byte.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
							var itemInput = this.appendStatementInput('ITEM' + this.itemCount_).appendField(new Blockly.FieldImage('img/blocks/do.svg',16*options.zoom,16*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
                            // Reconnect any child blocks.
                            if (clauseBlock.valueConnection_) {
                                dataInput.connection.connect(clauseBlock.valueConnection_);
                            }
                            if (clauseBlock.statementConnection_) {
                                itemInput.connection.connect(clauseBlock.statementConnection_);
                            }
                            break;
                        default:
                            throw 'Unknown block type.';
                    }
                    clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
                }
            },
            saveConnections: function(containerBlock) {
                var clauseBlock = containerBlock.getInputTargetBlock('STACK');
                var x = 1;
                while (clauseBlock) {
                    switch (clauseBlock.type) {
                        case 'bluetooth_app_item':
                            var inputData = this.getInput('DATA' + x);
							var inputItem = this.getInput('ITEM' + x);
                            clauseBlock.valueConnection_ =
                                inputData && inputData.connection.targetConnection;
                            clauseBlock.statementConnection_ =
                                inputItem && inputItem.connection.targetConnection;
                            x++;
                            break;
                        default:
                            throw 'Unknown block type.';
                    }
                    clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
                }
            }
        };
		
		Blockly.Blocks.bluetooth_app_app = {
            // App
			colour: Facilino.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_BLUETOOTH_APP_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/bluetooth.svg",12*options.zoom,12*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/inbox.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/smartphoneC.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.appendStatementInput('STACK').setCheck('bt_item');
                this.setTooltip(Facilino.locales.getKey('LANG_BLUETOOTH_APP_TOOLTIP'));
                this.contextMenu = false;
            }
        };
    
		Blockly.Blocks.bluetooth_app_item = {
			colour: Facilino.LANG_COLOUR_COMMUNICATION,
			keys: ['LANG_BLUETOOTH_COMMAND_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_COMMUNICATION);
                this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/byte.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.setPreviousStatement(true,'bt_item');
                this.setNextStatement(true,'bt_item');
                this.setTooltip(Facilino.locales.getKey('LANG_BLUETOOTH_COMMAND_TOOLTIP'));
        this.contextMenu = false;
            }
        };

    Blockly.Arduino.distance_us = function() {	
		Blockly.Arduino.definitions_['include_us'] = JST['distance_us_definitions_include']({});
		Blockly.Arduino.definitions_['define_us_pulseIn'] = JST['distance_us_definitions_pulseIn']({});
        Blockly.Arduino.definitions_['define_us_init'] = JST['distance_us_definitions_us_init']({});
        Blockly.Arduino.definitions_['define_us_distance'] = JST['distance_us_definitions_distance']({});
		var code = '';
		var echo_pin = this.getFieldValue('RED_PIN');
        var trigger_pin = this.getFieldValue('BLUE_PIN');
		Blockly.Arduino.setups_['setup_us_' + echo_pin + trigger_pin] = JST['distance_us_setups_echo']({'echo_pin': echo_pin});
		Blockly.Arduino.setups_['setup_us_2' + trigger_pin + echo_pin] = JST['distance_us_setups_trigger']({'trigger_pin': trigger_pin});
		code += JST['distance_us']({'trigger_pin': trigger_pin,'echo_pin': echo_pin});
		return [code, Blockly.Arduino.ORDER_ATOMIC];
        };
		
        Blockly.Blocks.distance_us = {
            category: Facilino.locales.getKey('LANG_CATEGORY_DISTANCE'),
            category_colour: Facilino.LANG_COLOUR_DISTANCE,
			colour: Facilino.LANG_COLOUR_DISTANCE,
			keys: ['LANG_US_ECHO_PIN','LANG_US_TRIGGER_PIN','LANG_US_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_DISTANCE);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/ultrasound.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/hc_sr04.svg',36*options.zoom,20*options.zoom));
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/hearing.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'RED_PIN');
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/speaking.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'BLUE_PIN');
				this.setFieldValue('3','BLUE_PIN');
				this.setInputsInline(true);
                this.setOutput(true, Number);
                this.setTooltip(Facilino.locales.getKey('LANG_US_TOOLTIP'));
            }
        };

    Blockly.Arduino.distance_us_collision = function() {
		Blockly.Arduino.definitions_['include_us'] = JST['distance_us_definitions_include']({});
		Blockly.Arduino.definitions_['define_us_pulseIn'] = JST['distance_us_definitions_pulseIn']({});
        Blockly.Arduino.definitions_['define_us_init'] = JST['distance_us_definitions_us_init']({});
        Blockly.Arduino.definitions_['define_us_distance'] = JST['distance_us_definitions_distance']({});
		var echo_pin = this.getFieldValue('RED_PIN');
        var trigger_pin = this.getFieldValue('BLUE_PIN');
        var distance = Blockly.Arduino.valueToCode(this, 'DISTANCE', Blockly.Arduino.ORDER_ATOMIC);
        var collision = Blockly.Arduino.statementToCode(this,'COLLISION') || '';
        var not_collision = Blockly.Arduino.statementToCode(this,'NOT_COLLISION') || '';
        var code = '';
		Blockly.Arduino.setups_['setup_us_' + echo_pin + trigger_pin] = JST['distance_us_setups_echo']({'echo_pin': echo_pin});
		Blockly.Arduino.setups_['setup_us_2' + trigger_pin + echo_pin] = JST['distance_us_setups_trigger']({'trigger_pin': trigger_pin});
		code += JST['distance_us_collision']({'trigger_pin': trigger_pin,'echo_pin': echo_pin,'distance': distance,'collision': collision,'not_collision': not_collision});
        return code;
        };

    Blockly.Blocks.distance_us_collision = {
            category: Facilino.locales.getKey('LANG_CATEGORY_DISTANCE'),
            category_colour: Facilino.LANG_COLOUR_DISTANCE,
			colour: Facilino.LANG_COLOUR_DISTANCE,
			keys: ['LANG_US_COLLISION_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_DISTANCE);
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/ultrasound.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/hc_sr04.svg',36*options.zoom,20*options.zoom));
                this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/hearing.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'RED_PIN');
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/speaking.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'BLUE_PIN');
				this.setFieldValue('3','BLUE_PIN');
				this.appendValueInput('DISTANCE').appendField(new Blockly.FieldImage('img/blocks/distance.svg',20*options.zoom,20*options.zoom)).setCheck(Number).setAlign(Blockly.ALIGN_RIGHT);
                this.appendStatementInput('COLLISION').appendField(new Blockly.FieldImage('img/blocks/rear-end-collision.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
        this.appendStatementInput('NOT_COLLISION').appendField(new Blockly.FieldImage('img/blocks/no-collision.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck('code');
        this.setInputsInline(true);
        this.setPreviousStatement(true,'code');
            this.setNextStatement(true,'code');
                this.setTooltip(Facilino.locales.getKey('LANG_US_COLLISION_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.led_matrix_generic_expression1 = function() {
				var cs_pin = 10;
				var din_pin = 12;
				var clk_pin = 11;
				var expr_str = Blockly.Arduino.valueToCode(this, 'EXPRESSION', Blockly.Arduino.ORDER_NONE);
				var dropdown_configuration = this.getFieldValue('CONFIGURATION') || '';
				var code = '';
				Blockly.Arduino.definitions_['define_LEDMatrix_init'] = JST['led_matrix_definitions_LEDMatrix_init']({});
				Blockly.Arduino.definitions_['define_writeRow'] = JST['led_matrix_definitions_writeRow']({});
				Blockly.Arduino.definitions_['define_maxAll'] = JST['led_matrix_definitions_maxAll']({});
				Blockly.Arduino.definitions_['define_putByte'] = JST['led_matrix_definitions_putByte']({});
				Blockly.Arduino.definitions_['define_expression'] = JST['led_matrix_definition_expression']({});
				//console.log(cs_pin);
				Blockly.Arduino.setups_['setup_cs_' + cs_pin + din_pin + clk_pin] = JST['pinmode_setups_dout']({'cs_pin': cs_pin});
				Blockly.Arduino.setups_['setup_din_' + cs_pin + din_pin + clk_pin] = JST['pinmode_setups_din']({'din_pin': din_pin});
				Blockly.Arduino.setups_['setup_clk_' + cs_pin + din_pin + clk_pin] = JST['pinmode_setups_clk']({'clk_pin': clk_pin});
				Blockly.Arduino.setups_['setup_LEDMatrix_' + cs_pin + din_pin + clk_pin] = JST['led_matrix_setups_LEDMatrix']({'cs_pin' : cs_pin,'din_pin' : din_pin,'clk_pin': clk_pin});
				var expr ='';
				var row = expr_str.split(',');
				//console.log(expr_str);
				var col = [];
				if (dropdown_configuration==='FALSE'){
					row[0] = ((row[0]%2)<1? 0 : 128) + ((row[0]%4)<2? 0 : 64) + ((row[0]%8)<4? 0 : 32) + ((row[0]%16)<8? 0 : 16) + ((row[0]%32)<16? 0 : 8) + ((row[0]%64)<32? 0 : 4) + ((row[0]%128)<64? 0 : 2) + (row[0]<128? 0 : 1);
					row[1] = ((row[1]%2)<1? 0 : 128) + ((row[1]%4)<2? 0 : 64) + ((row[1]%8)<4? 0 : 32) + ((row[1]%16)<8? 0 : 16) + ((row[1]%32)<16? 0 : 8) + ((row[1]%64)<32? 0 : 4) + ((row[1]%128)<64? 0 : 2) + (row[1]<128? 0 : 1);
					row[2] = ((row[2]%2)<1? 0 : 128) + ((row[2]%4)<2? 0 : 64) + ((row[2]%8)<4? 0 : 32) + ((row[2]%16)<8? 0 : 16) + ((row[2]%32)<16? 0 : 8) + ((row[2]%64)<32? 0 : 4) + ((row[2]%128)<64? 0 : 2) + (row[2]<128? 0 : 1);
					row[3] = ((row[3]%2)<1? 0 : 128) + ((row[3]%4)<2? 0 : 64) + ((row[3]%8)<4? 0 : 32) + ((row[3]%16)<8? 0 : 16) + ((row[3]%32)<16? 0 : 8) + ((row[3]%64)<32? 0 : 4) + ((row[3]%128)<64? 0 : 2) + (row[3]<128? 0 : 1);
					row[4] = ((row[4]%2)<1? 0 : 128) + ((row[4]%4)<2? 0 : 64) + ((row[4]%8)<4? 0 : 32) + ((row[4]%16)<8? 0 : 16) + ((row[4]%32)<16? 0 : 8) + ((row[4]%64)<32? 0 : 4) + ((row[4]%128)<64? 0 : 2) + (row[4]<128? 0 : 1);
					row[5] = ((row[5]%2)<1? 0 : 128) + ((row[5]%4)<2? 0 : 64) + ((row[5]%8)<4? 0 : 32) + ((row[5]%16)<8? 0 : 16) + ((row[5]%32)<16? 0 : 8) + ((row[5]%64)<32? 0 : 4) + ((row[5]%128)<64? 0 : 2) + (row[5]<128? 0 : 1);
					row[6] = ((row[6]%2)<1? 0 : 128) + ((row[6]%4)<2? 0 : 64) + ((row[6]%8)<4? 0 : 32) + ((row[6]%16)<8? 0 : 16) + ((row[6]%32)<16? 0 : 8) + ((row[6]%64)<32? 0 : 4) + ((row[6]%128)<64? 0 : 2) + (row[6]<128? 0 : 1);
					row[7] = ((row[7]%2)<1? 0 : 128) + ((row[7]%4)<2? 0 : 64) + ((row[7]%8)<4? 0 : 32) + ((row[7]%16)<8? 0 : 16) + ((row[7]%32)<16? 0 : 8) + ((row[7]%64)<32? 0 : 4) + ((row[7]%128)<64? 0 : 2) + (row[7]<128? 0 : 1);
					expr = row[0] + ',' + row[1] + ','+ row[2] + ','+ row[3] + ','+ row[4] + ','+ row[5] + ','+ row[6] + ','+ row[7];
				}
				else
				{
					expr = row[7] + ',' + row[6] + ','+ row[5] + ','+ row[4] + ','+ row[3] + ','+ row[2] + ','+ row[1] + ','+ row[0];
				}
				code += 'expression('+cs_pin+',' +din_pin+',' +clk_pin+',' + expr + ');\n';
				return code;
				};

			Blockly.Blocks.led_matrix_generic_expression1 = {
					category: Facilino.locales.getKey('LANG_CATEGORY_SCREEN'),
					category_colour: Facilino.LANG_COLOUR_SCREEN,
					colour: Facilino.LANG_COLOUR_SCREEN,
					keys: ['LANG_LED_MATRIX_GENERIC_TOOLTIP'],
					init: function() {
						this.setColour(Facilino.LANG_COLOUR_SCREEN);
						this.appendValueInput('EXPRESSION').appendField(new Blockly.FieldImage('img/blocks/LED_matrix.svg',36*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/rotate.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldCheckbox('FALSE'),"CONFIGURATION").appendField(new Blockly.FieldImage("img/blocks/dot-matrix.svg", 20*options.zoom, 20*options.zoom, "*")).setCheck('Expression').setAlign(Blockly.ALIGN_RIGHT);
						this.setInputsInline(true);
						this.setPreviousStatement(true,'code');
						this.setNextStatement(true,'code');
						this.setTooltip(Facilino.locales.getKey('LANG_LED_MATRIX_GENERIC_TOOLTIP'));
					}
				};
		
		Blockly.Arduino.led_matrix_drawing_icons1 = function() {
			var str = this.getFieldValue('ICON');
			var row1,row2,row3,row4,row5,row6,row7,row8;
			var col1,col2,col3,col4,col5,col6,col7,col8;
			var code='';
			row1=parseInt(str.substr(0,2) || '00',16);
			row2=parseInt(str.substr(2,2) || '00',16);
			row3=parseInt(str.substr(4,2) || '00',16);
			row4=parseInt(str.substr(6,2) || '00',16);
			row5=parseInt(str.substr(8,2) || '00',16);
			row6=parseInt(str.substr(10,2) || '00',16);
			row7=parseInt(str.substr(12,2) || '00',16);
			row8=parseInt(str.substr(14,2) || '00',16);
			col1 = ((row1%2)<1? 0 : 1) + ((row2%2)<1? 0 : 2) + ((row3%2)<1? 0 : 4) + ((row4%2)<1? 0 : 8) + ((row5%2)<1? 0 : 16) + ((row6%2)<1? 0 : 32) + ((row7%2)<1? 0 : 64) + ((row8%2)<1? 0 : 128);
			col2 = ((row1%4)<2? 0 : 1) + ((row2%4)<2? 0 : 2) + ((row3%4)<2? 0 : 4) + ((row4%4)<2? 0 : 8) + ((row5%4)<2? 0 : 16) + ((row6%4)<2? 0 : 32) + ((row7%4)<2? 0 : 64) + ((row8%4)<2? 0 : 128);
			col3 = ((row1%8)<4? 0 : 1) + ((row2%8)<4? 0 : 2) + ((row3%8)<4? 0 : 4) + ((row4%8)<4? 0 : 8) + ((row5%8)<4? 0 : 16) + ((row6%8)<4? 0 : 32) + ((row7%8)<4? 0 : 64) + ((row8%8)<4? 0 : 128);
			col4 = ((row1%16)<8? 0 : 1) + ((row2%16)<8? 0 : 2) + ((row3%16)<8? 0 : 4) + ((row4%16)<8? 0 : 8) + ((row5%16)<8? 0 : 16) + ((row6%16)<8? 0 : 32) + ((row7%16)<8? 0 : 64) + ((row8%16)<8? 0 : 128);
			col5 = ((row1%32)<16? 0 : 1) + ((row2%32)<16? 0 : 2) + ((row3%32)<16? 0 : 4) + ((row4%32)<16? 0 : 8) + ((row5%32)<16? 0 : 16) + ((row6%32)<16? 0 : 32) + ((row7%32)<16? 0 : 64) + ((row8%32)<16? 0 : 128);
			col6 = ((row1%64)<32? 0 : 1) + ((row2%64)<32? 0 : 2) + ((row3%64)<32? 0 : 4) + ((row4%64)<32? 0 : 8) + ((row5%64)<32? 0 : 16) + ((row6%64)<32? 0 : 32) + ((row7%64)<32? 0 : 64) + ((row8%64)<32? 0 : 128);
			col7 = ((row1%128)<64? 0 : 1) + ((row2%128)<64? 0 : 2) + ((row3%128)<64? 0 : 4) + ((row4%128)<64? 0 : 8) + ((row5%128)<64? 0 : 16) + ((row6%128)<64? 0 : 32) + ((row7%128)<64? 0 : 64) + ((row8%128)<64? 0 : 128);
			col8 = (row1<128? 0 : 1) + (row2<128? 0 : 2) + (row3<128? 0 : 4) + (row4<128? 0 : 8) + (row5<128? 0 : 16) + (row6<128? 0 : 32) + (row7<128? 0 : 64) + (row8<128? 0 : 128);
			col1 = Facilino.pad(col1.toString(16),0,2);
			col2 = Facilino.pad(col2.toString(16),0,2);
			col3 = Facilino.pad(col3.toString(16),0,2);
			col4 = Facilino.pad(col4.toString(16),0,2);
			col5 = Facilino.pad(col5.toString(16),0,2);
			col6 = Facilino.pad(col6.toString(16),0,2);
			col7 = Facilino.pad(col7.toString(16),0,2);
			col8 = Facilino.pad(col8.toString(16),0,2);
			str = col1+col2+col3+col4+col5+col6+col7+col8;
			row1=parseInt(str.substr(0,2) || '00',16);
			row2=parseInt(str.substr(2,2) || '00',16);
			row3=parseInt(str.substr(4,2) || '00',16);
			row4=parseInt(str.substr(6,2) || '00',16);
			row5=parseInt(str.substr(8,2) || '00',16);
			row6=parseInt(str.substr(10,2) || '00',16);
			row7=parseInt(str.substr(12,2) || '00',16);
			row8=parseInt(str.substr(14,2) || '00',16);
			code = row1 + ',' + row2 + ','+ row3 + ','+ row4 + ','+ row5 + ','+ row6 + ','+ row7 + ','+ row8;
			
			return [code, Blockly.Arduino.ORDER_ATOMIC];
		};
	
		Blockly.Blocks.led_matrix_drawing_icons1 = {
				category: Facilino.locales.getKey('LANG_CATEGORY_SCREEN'),
				category_colour: Facilino.LANG_COLOUR_SCREEN,
				colour: Facilino.LANG_COLOUR_SCREEN,
				keys: ['LANG_LED_MATRIX_DRAWING_NO_CONNECTION','LANG_LED_MATRIX_DRAWING_POOR_CONNECTION','LANG_LED_MATRIX_DRAWING_GOOD_CONNECTION','LANG_LED_MATRIX_DRAWING_EXCELLECT_CONNECTION','LANG_LED_MATRIX_DRAWING_NO_BATTERY','LANG_LED_MATRIX_DRAWING_LOW_BATTERY','LANG_LED_MATRIX_DRAWING_MEDIUM_BATTERY','LANG_LED_MATRIX_DRAWING_FULL_BATTERY','LANG_LED_MATRIX_DRAWING_CORRECT','LANG_LED_MATRIX_DRAWING_WRONG','LANG_LED_MATRIX_DRAWING_ARROW_UP','LANG_LED_MATRIX_DRAWING_ARROW_DOWN','LANG_LED_MATRIX_DRAWING_ARROW_RIGHT','LANG_LED_MATRIX_DRAWING_ARROW_LEFT','LANG_LED_MATRIX_DRAWING_ICONS_TOOLTIP'],
				init: function() {
					this.setColour(Facilino.LANG_COLOUR_SCREEN);
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/dot-matrix.svg", 20*options.zoom, 20*options.zoom, "*")).appendField(new Blockly.FieldDropdown([
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_NO_CONNECTION'),'0100000000000000'],
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_POOR_CONNECTION'),'0504040000000000'],
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_GOOD_CONNECTION'),'1514141010000000'],
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_EXCELLECT_CONNECTION'),'5554545050404000'],
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_NO_BATTERY'),'3f21212121212121'],
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_LOW_BATTERY'),'3f212d2121212121'],
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_MEDIUM_BATTERY'),'3f212d212d212121'],
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_FULL_BATTERY'),'3f212d212d212d21'],
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_CORRECT'),'00040a1120408000'],
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_WRONG'),'0042241818244200'],
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_ARROW_UP'),'383838fe7c381000'],
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_ARROW_DOWN'),'10387cfe38383800'],
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_ARROW_RIGHT'),'10307efe7e301000'],
						[Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_ARROW_LEFT'),'1018fcfefc181000']
					]), 'ICON').setAlign(Blockly.ALIGN_RIGHT);
					this.setInputsInline(false);
					this.setOutput(true,'Expression');
				this.setTooltip(Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_ICONS_TOOLTIP'));
				}
			};
		
		
		Blockly.Arduino.led_matrix_drawing1 = function() {
        var code = '';
		var data = [];
		for (i=0;i<8;i++)
		{
			data[i]=0;
			for (j=0;j<8;j++)
			{
				var field_name = 'COL'+(j)+(i);
				if (this.getFieldValue(field_name)==='#ff0000')
					data[i]+=Math.pow(2,(7-j));
			}
		}
		code = data[0]+','+data[1]+','+data[2]+','+data[3]+','+data[4]+','+data[5]+','+data[6]+','+data[7];
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Blocks.led_matrix_drawing1 = {
            category: Facilino.locales.getKey('LANG_CATEGORY_SCREEN'),
            category_colour: Facilino.LANG_COLOUR_SCREEN,
			colour: Facilino.LANG_COLOUR_SCREEN,
			keys: ['LANG_LED_MATRIX_DRAWING_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_SCREEN);
				var colours = [];
				for (i=0;i<8;i++)
				{
					for (j=0;j<8;j++)
					{
						var col_num=''+i+j;
						colours[col_num]=new Blockly.FieldColour('#000000');
						colours[col_num].setColours(['#000000','#FF0000']).setColumns(2);
					}
				}
				this.appendDummyInput('').appendField(' ').appendField(colours['00'],'COL00').appendField(colours['01'],'COL01').appendField(colours['02'],'COL02').appendField(colours['03'],'COL03').appendField(colours['04'],'COL04').appendField(colours['05'],'COL05').appendField(colours['06'],'COL06').appendField(colours['07'],'COL07').setAlign(Blockly.ALIGN_RIGHT);
				
				this.appendDummyInput('').appendField(colours['10'],'COL10').appendField(colours['11'],'COL11').appendField(colours['12'],'COL12').appendField(colours['13'],'COL13').appendField(colours['14'],'COL14').appendField(colours['15'],'COL15').appendField(colours['16'],'COL16').appendField(colours['17'],'COL17').setAlign(Blockly.ALIGN_RIGHT);
				this.appendDummyInput('').appendField(colours['20'],'COL20').appendField(colours['21'],'COL21').appendField(colours['22'],'COL22').appendField(colours['23'],'COL23').appendField(colours['24'],'COL24').appendField(colours['25'],'COL25').appendField(colours['26'],'COL26').appendField(colours['27'],'COL27').setAlign(Blockly.ALIGN_RIGHT);
				this.appendDummyInput('').appendField(colours['30'],'COL30').appendField(colours['31'],'COL31').appendField(colours['32'],'COL32').appendField(colours['33'],'COL33').appendField(colours['34'],'COL34').appendField(colours['35'],'COL35').appendField(colours['36'],'COL36').appendField(colours['37'],'COL37').setAlign(Blockly.ALIGN_RIGHT);
				this.appendDummyInput('').appendField(colours['40'],'COL40').appendField(colours['41'],'COL41').appendField(colours['42'],'COL42').appendField(colours['43'],'COL43').appendField(colours['44'],'COL44').appendField(colours['45'],'COL45').appendField(colours['46'],'COL46').appendField(colours['47'],'COL47').setAlign(Blockly.ALIGN_RIGHT);
				this.appendDummyInput('').appendField(colours['50'],'COL50').appendField(colours['51'],'COL51').appendField(colours['52'],'COL52').appendField(colours['53'],'COL53').appendField(colours['54'],'COL54').appendField(colours['55'],'COL55').appendField(colours['56'],'COL56').appendField(colours['57'],'COL57').setAlign(Blockly.ALIGN_RIGHT);
				this.appendDummyInput('').appendField(colours['60'],'COL60').appendField(colours['61'],'COL61').appendField(colours['62'],'COL62').appendField(colours['63'],'COL63').appendField(colours['64'],'COL64').appendField(colours['65'],'COL65').appendField(colours['66'],'COL66').appendField(colours['67'],'COL67').setAlign(Blockly.ALIGN_RIGHT);
				this.appendDummyInput('').appendField(colours['70'],'COL70').appendField(colours['71'],'COL71').appendField(colours['72'],'COL72').appendField(colours['73'],'COL73').appendField(colours['74'],'COL74').appendField(colours['75'],'COL75').appendField(colours['76'],'COL76').appendField(colours['77'],'COL77').setAlign(Blockly.ALIGN_RIGHT);
				this.setInputsInline(false);
				this.setOutput(true,'Expression');
            this.setTooltip(Facilino.locales.getKey('LANG_LED_MATRIX_DRAWING_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.infrared_analog = function() {
			var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            code += JST['inout_analog_read']({
                'dropdown_pin': dropdown_pin
            });
            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };
		
        Blockly.Blocks.infrared_analog = {
            category: Facilino.locales.getKey('LANG_CATEGORY_LIGHT'),
            category_colour: Facilino.LANG_COLOUR_LIGHT,
			colour: Facilino.LANG_COLOUR_LIGHT,
			keys: ['LANG_INFRARED_ANALOG_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_LIGHT);
                this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/light_diode.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/TCRT5000.svg', 48*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/analog_signal.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.analog),'PIN');
				this.setOutput(true, Number);
                this.setTooltip(Facilino.locales.getKey('LANG_INFRARED_ANALOG_TOOLTIP'));
            }
        };
		
		
			Blockly.Arduino.infrared_digital = function() {
				var dropdown_pin = this.getFieldValue('PIN');
				var code = '';
				Blockly.Arduino.setups_['setup_green_digital_read' + dropdown_pin] = JST['inout_digital_read_setups']({'dropdown_pin': dropdown_pin});
				code += JST['inout_digital_read']({'dropdown_pin': dropdown_pin});
				return [code, Blockly.Arduino.ORDER_ATOMIC];
			};


			Blockly.Blocks.infrared_digital = {
				category: Facilino.locales.getKey('LANG_CATEGORY_LIGHT'),
				category_colour: Facilino.LANG_COLOUR_LIGHT,
				colour: Facilino.LANG_COLOUR_LIGHT,
				keys: ['LANG_INFRARED_DIGITAL_TOOLTIP'],
				output: 'boolean',
				init: function() {
					this.setColour(Facilino.LANG_COLOUR_LIGHT);
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/light_diode.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/TCRT5000.svg', 48*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
					this.setOutput(true, Boolean);
					this.setTooltip(Facilino.locales.getKey('LANG_INFRARED_DIGITAL_TOOLTIP'));
				}
			};
		
		Blockly.Arduino.piezo_buzzer_predef_sounds = function() {
			var dropdown_pin = this.getFieldValue('PIN');
			var code= '';
			var pin='';
			Blockly.Arduino.definitions_['define_simpleexpressions_buzzer_tone_'+dropdown_pin]='void _tone(int buzzerPin, float noteFrequency, long noteDuration, int silentDuration){\n  tone(buzzerPin, noteFrequency, noteDuration);\n  delay(noteDuration);\n  delay(silentDuration);\n}\n';
			Blockly.Arduino.definitions_['define_simpleexpressions_buzzer_bendtones_'+dropdown_pin]='void bendTones (int buzzerPin, float initFrequency, float finalFrequency, float prop, long noteDuration, int silentDuration){\n  if(initFrequency < finalFrequency){\n    for (int i=initFrequency; i<finalFrequency; i=i*prop) {\n      _tone(buzzerPin,i,noteDuration,silentDuration);\n    }\n  }  else{\n    for (int i=initFrequency; i>finalFrequency; i=i/prop) {\n      _tone(buzzerPin,i,noteDuration,silentDuration);\n}\n}\n}\n';
			pin = dropdown_pin+',';
			var option=this.getFieldValue('OPTION');
			if (option==='0')
				code+='_tone('+pin+'659.26,50,30);\n_tone('+pin+'1318.51,55,25);\n_tone('+pin+'1760,60,10);\n';
			else if (option==='1')
				code+='_tone('+pin+'659.26,50,30);\n_tone('+pin+'1760,55,25);\n_tone('+pin+'1318.51,50,10);\n';
			else if (option==='2')
				code+='bendTones('+pin+'1318.51, 1567.98, 1.03, 20, 2);\ndelay(30);\nbendTones('+pin+'1318.51, 2349.32, 1.04, 10, 2);\n';
			else if (option==='3')
				code+='bendTones('+pin+'1318.51, 1760, 1.02, 30, 10);\n';
			else if (option==='4')
				code+='bendTones('+pin+'1567.98, 2349.32, 1.03, 30, 10);\n';
			else if (option==='5')
				code+='_tone('+pin+'1318.51,50,100);\n_tone('+pin+'1567.98,50,80);\n_tone('+pin+'2349.32,300,1);\n';
            return code;
        };
		
		Blockly.Blocks.piezo_buzzer_predef_sounds = {
            category: Facilino.locales.getKey('LANG_CATEGORY_SOUND'),
            category_colour: Facilino.LANG_COLOUR_SOUND,
			colour: Facilino.LANG_COLOUR_SOUND,
			keys: ['LANG_PIEZO_BUZZER','LANG_PIEZO_BUZZER_PIN','LANG_PIEZZO_BUZZER_PREDEF_CONNECTION','LANG_PIEZZO_BUZZER_PREDEF_DISCONNECTION','LANG_PIEZZO_BUZZER_PREDEF_BUTTON_PUSHED','LANG_PIEZZO_BUZZER_PREDEF_MODE1','LANG_PIEZZO_BUZZER_PREDEF_MODE2','LANG_PIEZZO_BUZZER_PREDEF_MODE3','LANG_PIEZO_BUZZER_PREDEF_SOUNDS_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_SOUND);
				var opt = new Blockly.FieldDropdown([
                        [Facilino.locales.getKey('LANG_PIEZZO_BUZZER_PREDEF_CONNECTION'), '0'],
						[Facilino.locales.getKey('LANG_PIEZZO_BUZZER_PREDEF_DISCONNECTION'), '1'],
                        [Facilino.locales.getKey('LANG_PIEZZO_BUZZER_PREDEF_BUTTON_PUSHED'), '2'],
						[Facilino.locales.getKey('LANG_PIEZZO_BUZZER_PREDEF_MODE1'), '3'],
                        [Facilino.locales.getKey('LANG_PIEZZO_BUZZER_PREDEF_MODE2'), '4'],
						[Facilino.locales.getKey('LANG_PIEZZO_BUZZER_PREDEF_MODE3'), '5']
                    ]);
					this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/speaker.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
					this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/musical-note.svg',20*options.zoom,20*options.zoom)).appendField(opt, 'OPTION').setAlign(Blockly.ALIGN_RIGHT);
					this.setInputsInline(true);
					this.setPreviousStatement(true,'code');
					this.setNextStatement(true,'code');
					this.setTooltip(Facilino.locales.getKey('LANG_PIEZO_BUZZER_PREDEF_SOUNDS_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.piezo_buzzer_melody = function() {
			var dropdown_pin = this.getFieldValue('PIN');
			var code ='';
			
			if (this.getInputTargetBlock('MELODY')===null)
				return code;
			
			var melody = Blockly.Arduino.valueToCode(this, 'MELODY', Blockly.Arduino.ORDER_ATOMIC).substring(1);
			var s = melody.replace(',','');
			var enc='_melody'+this.NumMelodies;
			melody = melody.substring(0,melody.length-1);
			Blockly.Arduino.definitions_['declare_var_play_melody'+enc] = 'const uint16_t '+enc+'[] = {'+melody+'};\n';
			Blockly.Arduino.definitions_['define_play_melody'] = JST['music_definitions_play_melody']({});
			code += JST['music_play_melody']({'pin': dropdown_pin,'melody': enc});
			return code;
        };


        Blockly.Blocks.piezo_buzzer_melody = {
            category: Facilino.locales.getKey('LANG_CATEGORY_SOUND'),
            category_colour: Facilino.LANG_COLOUR_SOUND,
			colour: Facilino.LANG_COLOUR_SOUND,
			keys: ['LANG_PIEZO_BUZZER_MELODY_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_SOUND);
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/speaker.svg',20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
				this.appendValueInput('MELODY').appendField(new Blockly.FieldImage('img/blocks/clef.svg',20*options.zoom,20*options.zoom)).setCheck(['MELODY','NOTE']).setAlign(Blockly.ALIGN_RIGHT);
				this.setInputsInline(true);
				this.setPreviousStatement(true,'code');
                this.setNextStatement(true,'code');
				Facilino.NumMelodies=Facilino.NumMelodies+1;
				this.NumMelodies=Facilino.NumMelodies;
                this.setTooltip(Facilino.locales.getKey('LANG_PIEZO_BUZZER_MELODY_TOOLTIP'));
            },
			onchange: function()
			{
				if (this!==undefined)
					Blockly.Arduino.play_melody='';
			}
        };

		function noteCreator(item,index){
			var duration,note;
			if (item.duration==='redonda')
				duration='1500';
			else if (item.duration==='blanca')
				duration='750';
			else if (item.duration==='negra')
				duration='375';
			else if (item.duration==='corchea')
				duration='187';
			else if (item.duration==='semicorchea')
				duration='93';
			if (item.note==='silencio')
				note='0';
			else if (item.note==='do')
				note='262';
			else if (item.note==='re')
				note='294';
			else if (item.note==='mi')
				note='330';
			else if (item.note==='fa')
				note='349';
			else if (item.note==='sol')
				note='392';
			else if (item.note==='la')
				note='440';
			else if (item.note==='si')
				note='494';
			var note_name=item.note+'_'+item.duration;
			Blockly.Arduino['piezo_music_'+note_name] = function() {
				var melody = Blockly.Arduino.valueToCode(this, 'MELODY', Blockly.Arduino.ORDER_ATOMIC) || '';
				code = ','+note+','+duration+melody;
				return [code, Blockly.Arduino.ORDER_ATOMIC];
			};
			var note_path = 'img/blocks/'+note_name+'.svg';
			Blockly.Blocks['piezo_music_'+note_name] = {
            category: Facilino.locales.getKey('LANG_CATEGORY_SOUND'),
            category_colour: Facilino.LANG_COLOUR_SOUND,
			colour: Facilino.LANG_COLOUR_SOUND,
			keys: ['LANG_MUSIC_NOTE_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_SOUND);
                this.appendValueInput('MELODY').appendField(new Blockly.FieldImage(note_path,32*options.zoom,48*options.zoom)).setCheck('NOTE').setAlign(Blockly.ALIGN_RIGHT);
				this.setInputsInline(false);
				this.setOutput(true,'NOTE');
                this.setTooltip(Facilino.locales.getKey('LANG_MUSIC_NOTE_TOOLTIP'));
				}
			};
		}
		

		var d_alt=["redonda","blanca","negra","corchea","semicorchea"];
		var n_alt=["do","re","mi","fa","sol","la","si"];

		var notes=[{note: 'silencio',duration: 'redonda'},
				   {note: 'silencio',duration: 'blanca'},
				   {note: 'silencio',duration: 'negra'},
				   {note: 'silencio',duration: 'corchea'},
				   {note: 'silencio',duration: 'semicorchea'}];
				   
		var notes_counter=notes.length;		
		n_alt.forEach(function (ni){				
				d_alt.forEach(function (di){
					notes[notes_counter]={note: ni, duration: di};
					notes_counter=notes_counter+1;
				});
		});
		
		notes.forEach(noteCreator);

    Blockly.Arduino.piezo_music_end = function() {
        var code = ';';
        return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

        Blockly.Blocks.piezo_music_end = {
            category: Facilino.locales.getKey('LANG_CATEGORY_SOUND'),
            category_colour: Facilino.LANG_COLOUR_SOUND,
			colour: Facilino.LANG_COLOUR_SOUND,
			keys: ['LANG_MUSIC_NOTE_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_SOUND);
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/end.svg',32*options.zoom,48*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                this.setInputsInline(false);
				this.setOutput(true,'NOTE');
                this.setTooltip(Facilino.locales.getKey('LANG_MUSIC_NOTE_TOOLTIP'));
            }
        };

			Blockly.Arduino.servo_cont1 = function() {
				var dropdown_pin = this.getFieldValue('PIN');
				var value_speed = Blockly.Arduino.valueToCode(this, 'SPEED', Blockly.Arduino.ORDER_ATOMIC);
				var code = '';
				Blockly.Arduino.definitions_['include_servo'] = '#include <Servo.h>';
				Blockly.Arduino.definitions_['declare_var_servo_'+dropdown_pin]=JST['servo_definitions_variables']({pin: dropdown_pin});
				Blockly.Arduino.setups_['servo_move_' + dropdown_pin] = JST['servo_setups']({'dropdown_pin': dropdown_pin});
				code += JST['servo_cont1']({'dropdown_pin': dropdown_pin,'value_speed': value_speed});
				return code;
			};

			Blockly.Blocks.servo_cont1 = {
				category: Facilino.locales.getKey('LANG_CATEGORY_MOVEMENT'),
				category_colour: Facilino.LANG_COLOUR_MOVEMENT,
				colour: Facilino.LANG_COLOUR_MOVEMENT,
				keys: ['LANG_SERVO_CONT_TOOLTIP'],
				init: function() {
					this.setColour(Facilino.LANG_COLOUR_MOVEMENT);
					this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/servo_cont.svg', 20*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
					this.appendValueInput('SPEED').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/speedometer.svg', 20*options.zoom, 20*options.zoom));
					this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/percent.svg',20*options.zoom,20*options.zoom));
					this.setPreviousStatement(true,'code');
					this.setNextStatement(true,'code');
					this.setInputsInline(true);
					this.setTooltip(Facilino.locales.getKey('LANG_SERVO_CONT_TOOLTIP'));
				},
				isVariable: function(varValue) {
					for (var i in Blockly.Variables.allUsedVariables) {
						if (Blockly.Variables.allUsedVariables[i] === varValue) {
							return true;
						}
					}
					return false;
				}
			};
		
			Blockly.Arduino.dc_motor1 = function() {
				var dropdown_pin1 = this.getFieldValue('PIN1');
				var dropdown_pin2 = this.getFieldValue('PIN2');
				var value_dir = this.getFieldValue('ROT');
				var value_speed = Blockly.Arduino.valueToCode(this, 'SPEED', Blockly.Arduino.ORDER_ATOMIC);
				var code = '';
				Blockly.Arduino.setups_['setup_digital_write_' + dropdown_pin1] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pin1});
				Blockly.Arduino.setups_['setup_digital_write_' + dropdown_pin2] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pin2});
				code += '  {\n';
				code +='    int _speed = ((((int)('+value_speed+'))*255)/100);\n';
				code +='    if (_speed>0){\n';
				code +='      analogWrite('+dropdown_pin1+',_speed);\n';
				code +='      digitalWrite('+dropdown_pin2+',0);\n';
				code +='    }\n';
				code +='    else if (_speed<0){\n';
				code +='       digitalWrite('+dropdown_pin1+',0);\n';
				code +='       analogWrite('+dropdown_pin2+',_speed);\n';
				code +='    }\n';
				code +='    else{\n';
				code +='      digitalWrite('+dropdown_pin1+',1);\n';
				code +='      digitalWrite('+dropdown_pin2+',1);\n';
				code +='    }\n';
				code += '  }\n';
				return code;
			};

			Blockly.Blocks.dc_motor1 = {
				category: Facilino.locales.getKey('LANG_CATEGORY_MOVEMENT'),
				category_colour: Facilino.LANG_COLOUR_MOVEMENT,
				colour: Facilino.LANG_COLOUR_MOVEMENT,
				keys: ['LANG_SERVO_DC_MOTOR_TOOLTIP'],
				init: function() {
					this.setColour(Facilino.LANG_COLOUR_MOVEMENT);
					this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/engine.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
					this.appendDummyInput('').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/one.svg',16*options.zoom,16*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/pwm_signal.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.pwm),'PIN1');
					this.appendDummyInput('').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/two.svg',16*options.zoom,16*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/pwm_signal.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.pwm),'PIN2');
					this.appendValueInput('SPEED').setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/speedometer.svg', 20*options.zoom, 20*options.zoom));
					this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/percent.svg',20*options.zoom,20*options.zoom));
					this.setPreviousStatement(true,'code');
					this.setNextStatement(true,'code');
					this.setInputsInline(true);
					this.setTooltip(Facilino.locales.getKey('LANG_SERVO_DC_MOTOR_TOOLTIP'));
					this.setFieldValue('5','PIN2');
				},
				isVariable: function(varValue) {
					for (var i in Blockly.Variables.allUsedVariables) {
						if (Blockly.Variables.allUsedVariables[i] === varValue) {
							return true;
						}
					}
					return false;
				}
			};

			Blockly.Arduino.servo_move = function() {
				var dropdown_pin = this.getFieldValue('PIN');
				var value_degree = Blockly.Arduino.valueToCode(this, 'DEGREE', Blockly.Arduino.ORDER_ATOMIC);
				var code = '';
				Blockly.Arduino.definitions_['include_servo'] = '#include <Servo.h>';
				Blockly.Arduino.definitions_['declare_var_servo_'+dropdown_pin]=JST['servo_definitions_variables']({pin: dropdown_pin});
				Blockly.Arduino.setups_['servo_move_' + dropdown_pin] = JST['servo_setups']({'dropdown_pin': dropdown_pin});
				code += JST['servo_move']({'dropdown_pin': dropdown_pin,'value_degree': value_degree});
				return code;
			};

			Blockly.Blocks.servo_move = {
				category: Facilino.locales.getKey('LANG_CATEGORY_MOVEMENT'),
				category_colour: Facilino.LANG_COLOUR_MOVEMENT,
				colour: Facilino.LANG_COLOUR_MOVEMENT,
				keys: ['LANG_SERVO_MOVE_TOOLTIP'],
				//servo_move initialization
				init: function() {
					this.setColour(Facilino.LANG_COLOUR_MOVEMENT);
					this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/servo.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
					this.appendValueInput('DEGREE', Number).setCheck(Number).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/angle.svg', 20*options.zoom, 20*options.zoom));
					this.setPreviousStatement(true,'code');
					this.setNextStatement(true,'code');
					this.setInputsInline(true);
					this.setTooltip(Facilino.locales.getKey('LANG_SERVO_MOVE_TOOLTIP'));
				}
			};
		
			Blockly.Arduino.red_green_led = function() {
				var code = '';
				var dropdown_pinR = this.getFieldValue('PIN_R');
				var dropdown_pinG = this.getFieldValue('PIN_G');
				Blockly.Arduino.setups_['setup_digital_write_' + dropdown_pinR] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pinR});
				Blockly.Arduino.setups_['setup_digital_write_' + dropdown_pinG] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pinG});
				var color = this.getFieldValue('COLOR') || '#000000';
				if (color === '#000000')
				{				
					code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'LOW'});
					code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'LOW'});
				}
				else if (color ==='#ff0000')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'LOW'});
				}
				else if (color ==='#00ff00')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'HIGH'});
				}
				return code;
			};

			Blockly.Blocks.red_green_led = {
				category: Facilino.locales.getKey('LANG_CATEGORY_LIGHT'),
				category_colour: Facilino.LANG_COLOUR_LIGHT,
				colour: Facilino.LANG_COLOUR_LIGHT,
				keys: ['LANG_RG_LED_TOOLTIP'],
				//rgb led initialization
				init: function() {
					this.setColour(Facilino.LANG_COLOUR_LIGHT);
					var colour = new Blockly.FieldColour('#000000');
					colour.setColours(['#000000','#FF0000','#00FF00']).setColumns(3);
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/diode_led.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal_red.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN_R');
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal_green.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN_G');
					this.setFieldValue('D3','PIN_G');
					this.appendDummyInput('').appendField(' ').appendField(colour,'COLOR');
					this.setInputsInline(true);
					this.setPreviousStatement(true,'code');
					this.setNextStatement(true,'code');
					this.setTooltip(Facilino.locales.getKey('LANG_RG_LED_TOOLTIP'));
				}
			};
		
			Blockly.Arduino.rgb_led = function() {
				var code = '';
				var dropdown_pinR = this.getFieldValue('PIN_R');
				var dropdown_pinG = this.getFieldValue('PIN_G');
				var dropdown_pinB = this.getFieldValue('PIN_B');
				Blockly.Arduino.setups_['setup_digital_write_' + dropdown_pinR] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pinR});
				Blockly.Arduino.setups_['setup_digital_write_' + dropdown_pinG] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pinG});
				Blockly.Arduino.setups_['setup_digital_write_' + dropdown_pinB] = JST['inout_digital_write_setups']({'dropdown_pin': dropdown_pinB});
				var color = this.getFieldValue('COLOR') || '#000000';
				if (color === '#000000')
				{				
					code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'LOW'});
					code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'LOW'});
					code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'LOW'});
				}
				else if (color ==='#ffffff')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'HIGH'});
				}
				else if (color ==='#ff0000')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'LOW'});
				}
				else if (color ==='#ffff00')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'LOW'});
				}
				else if (color ==='#00ff00')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'LOW'});
				}
				else if (color ==='#00ffff')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'HIGH'});
				}
				else if (color ==='#0000ff')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'HIGH'});
				}
				else if (color ==='#ff00ff')
				{
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinR,'dropdown_stat': 'HIGH'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinG,'dropdown_stat': 'LOW'});
				  code += JST['inout_digital_write']({'dropdown_pin': dropdown_pinB,'dropdown_stat': 'HIGH'});
				}
				return code;
			};

			Blockly.Blocks.rgb_led = {
				category: Facilino.locales.getKey('LANG_CATEGORY_LIGHT'),
				category_colour: Facilino.LANG_COLOUR_LIGHT,
				colour: Facilino.LANG_COLOUR_LIGHT,
				keys: ['LANG_RGB_LED_TOOLTIP'],
				//rgb led initialization
				init: function() {
					this.setColour(Facilino.LANG_COLOUR_LIGHT);
					var colour = new Blockly.FieldColour('#000000');
					colour.setColours(['#000000','#FFFFFF','#FF0000','#FFFF00','#00FF00','#00FFFF','#0000FF','#FF00FF']).setColumns(2);
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/diode_led.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal_red.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN_R');
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal_green.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN_G');
					this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal_blue.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN_B');
					this.setFieldValue('D3','PIN_G');
					this.setFieldValue('D4','PIN_B');
					this.appendDummyInput('').appendField(' ').appendField(colour,'COLOR');
					this.setInputsInline(true);
					this.setPreviousStatement(true,'code');
					this.setNextStatement(true,'code');
					this.setTooltip(Facilino.locales.getKey('LANG_RGB_LED_TOOLTIP'));
				}
			};
	
		Blockly.Arduino.ambient_temp_temperature = function() {
				var code = '';
				var dropdown_pin = this.getFieldValue('PIN');
				Blockly.Arduino.definitions_['dallas_temp']=JST['dallas_temp_definitions_include']({});
				Blockly.Arduino.definitions_['one_wire_temp']=JST['one_wire_temp_definitions_include']({pin : dropdown_pin});
				Blockly.Arduino.definitions_['declare_var_define_dht_one_wire'+dropdown_pin]=JST['one_wire_temp_definitions_variables']({pin : dropdown_pin});
				Blockly.Arduino.definitions_['declare_var_define_dht_dallas'+dropdown_pin]=JST['dallas_temp_definitions_variables']({pin : dropdown_pin});
				Blockly.Arduino.setups_['setup_dallas_temp' + dropdown_pin] = JST['dallas_temp_setups']({pin: dropdown_pin});
				Blockly.Arduino.definitions_['one_wire_temp_readTempC']=JST['one_wire_definitions_readTempC']({pin: dropdown_pin});
				code += JST['one_wire_temp_readTempC']({});
			    return [code,Blockly.Arduino.CODE_ATOMIC];
        };

		Blockly.Blocks.ambient_temp_temperature = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_TEMP_REQUEST_AND_READ_TEMP_TOOLTIP'],
			output: 'number',
            init: function() {
			this.setColour(Facilino.LANG_COLOUR_AMBIENT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/thermometer.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/DS18B20.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg", 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
			this.setInputsInline(true);
			this.setPreviousStatement(false);
            this.setNextStatement(false);
			this.setOutput(true,Number);
            this.setTooltip(Facilino.locales.getKey('LANG_TEMP_REQUEST_AND_READ_TEMP_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.ambient_humid_humidityDHT = function() {
				var code = '';
				var dropdown_pin = this.getFieldValue('PIN');
				var type = 'DHT11';
				Blockly.Arduino.definitions_['dht']=JST['dht_definitions_include']({});
				Blockly.Arduino.definitions_['declare_var_define_dht'+type+dropdown_pin]=JST['dht_definitions_variables']({pin : dropdown_pin, type: type});
				Blockly.Arduino.setups_['setup_dht' + dropdown_pin] = JST['dht_setups']({pin: dropdown_pin, type: type});
				code += 'sensor'+type+'_'+dropdown_pin+'.readHumidity()'
				return [code,Blockly.Arduino.CODE_ATOMIC];
        };

		Blockly.Blocks.ambient_humid_humidityDHT = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_HUMID_READ_HUMID_DHT_TOOLTIP'],
			output: 'number',
            init: function() {
			this.setColour(Facilino.LANG_COLOUR_AMBIENT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/humidity.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/dht11.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg", 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
			this.setInputsInline(true);
			this.setPreviousStatement(false);
            this.setNextStatement(false);
			this.setOutput(true,Number);
            this.setTooltip(Facilino.locales.getKey('LANG_HUMID_READ_HUMID_DHT_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.ambient_temp_temperatureDHT = function() {
				var code = '';
				var dropdown_pin = this.getFieldValue('PIN');
				var type = 'DHT11';
				Blockly.Arduino.definitions_['dht']=JST['dht_definitions_include']({});
				Blockly.Arduino.definitions_['declare_var_define_dht'+type+dropdown_pin]=JST['dht_definitions_variables']({pin : dropdown_pin, type: type});
				Blockly.Arduino.setups_['setup_dht' + dropdown_pin] = JST['dht_setups']({pin: dropdown_pin, type: type});
				code += 'sensor'+type+'_'+dropdown_pin+'.readTemperature()'
				return [code,Blockly.Arduino.CODE_ATOMIC];
        };

		Blockly.Blocks.ambient_temp_temperatureDHT = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_TEMP_READ_TEMP_DHT_TOOLTIP'],
			output: 'number',
            init: function() {
			this.setColour(Facilino.LANG_COLOUR_AMBIENT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/thermometer.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/dht11.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg", 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
			this.setInputsInline(true);
			this.setPreviousStatement(false);
            this.setNextStatement(false);
			this.setOutput(true,Number);
            this.setTooltip(Facilino.locales.getKey('LANG_TEMP_READ_TEMP_DHT_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.ambient_temp_temperatureDHT_alarm = function() {
				var code = '';
				var dropdown_pin = this.getFieldValue('PIN');
				var temp_high = this.getFieldValue('temp_high');
				var high = Blockly.Arduino.statementToCode(this,'HIGH') || '';
				var temp_low = this.getFieldValue('temp_low');
				var low = Blockly.Arduino.statementToCode(this,'LOW') || '';
				var type = 'DHT11';
				//var once = this.getFieldValue('ONCE');
				Blockly.Arduino.definitions_['dht']=JST['dht_definitions_include']({});
				Blockly.Arduino.definitions_['declare_var_define_dht'+type+dropdown_pin]=JST['dht_definitions_variables']({pin : dropdown_pin, type: type});
				Blockly.Arduino.setups_['setup_dht' + dropdown_pin] = JST['dht_setups']({pin: dropdown_pin, type: type});
				var codehigh='else{\n'+indentSentences(high)+'\n}\n'
				var codelow='if(sensor'+type+'_'+dropdown_pin+'.readTemperature() >'+temp_low+'){\n'+indentSentences(low)+'\n}\n'
				code += codelow + codehigh
				return [code,Blockly.Arduino.CODE_ATOMIC];

        };

		Blockly.Blocks.ambient_temp_temperatureDHT_alarm = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_TEMP_READ_TEMP_DHT_TOOLTIP'],
			output: 'number',
            init: function() {
			this.setColour(Facilino.LANG_COLOUR_AMBIENT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/thermometer.svg",20*options.zoom,20*options.zoom))
				.appendField(new Blockly.FieldImage("img/blocks/dht11.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg", 20*options.zoom, 20*options.zoom))
				.setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
			this.appendStatementInput('HIGH').appendField(new Blockly.FieldImage("img/blocks/thermometer_high.svg",20*options.zoom,20*options.zoom))
				.appendField(new Blockly.FieldTextInput(""),'temp_high')
				.appendField(new Blockly.FieldLabel("ºC"))
			this.appendStatementInput('LOW').appendField(new Blockly.FieldImage("img/blocks/thermometer_low.svg",20*options.zoom,20*options.zoom))
				.appendField(new Blockly.FieldTextInput(""),'temp_low')
				.appendField(new Blockly.FieldLabel("ºC"))
			this.setInputsInline(true);
			this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
			
            this.setTooltip(Facilino.locales.getKey('LANG_TEMP_READ_TEMP_DHT_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.ambient_light_sensor = function() {
			var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            Blockly.Arduino.setups_['setup_analog_read' + dropdown_pin] = JST['inout_analog_read_setups']({'dropdown_pin': dropdown_pin});
            code += JST['inout_analog_read']({'dropdown_pin': dropdown_pin});
            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

		Blockly.Blocks.ambient_light_sensor = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_LIGHT_SENSOR_TOOLTIP'],
			output: 'number',
            init: function() {
			this.setColour(Facilino.LANG_COLOUR_AMBIENT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/sun.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/ldr.svg",48*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/analog_signal.svg", 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.analog),'PIN');
			this.setInputsInline(true);
			this.setPreviousStatement(false);
            this.setNextStatement(false);
			this.setOutput(true,Number);
            this.setTooltip(Facilino.locales.getKey('LANG_LIGHT_SENSOR_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.ambient_light_sensor_alarm = function() {
			var code = '';
				var dropdown_pin = this.getFieldValue('PIN');
				Blockly.Arduino.setups_['setup_analog_read' + dropdown_pin] = JST['inout_analog_read_setups']({'dropdown_pin': dropdown_pin});
				var light_high = this.getFieldValue('light_high');
				var light_high_c = (light_high * 1023)/100;
				var high = Blockly.Arduino.statementToCode(this,'HIGH') || '';
				var light_low = this.getFieldValue('light_low');
				var light_low_c = (light_low * 1023)/100;
				var low = Blockly.Arduino.statementToCode(this,'LOW') || '';
				var codehigh = 'else{\n'+indentSentences(high)+'\n}\n'
				var codelow = 'if('+JST['inout_analog_read']({'dropdown_pin': dropdown_pin})+'<'+light_low_c+'){\n'+indentSentences(low)+'\n}\n'
				code += codelow + codehigh
				return [code,Blockly.Arduino.CODE_ATOMIC];
        };

		Blockly.Blocks.ambient_light_sensor_alarm = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_LIGHT_SENSOR_TOOLTIP'],
			output: 'number',
            init: function() {
			this.setColour(Facilino.LANG_COLOUR_AMBIENT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/sun.svg",20*options.zoom,20*options.zoom))
				.appendField(new Blockly.FieldImage("img/blocks/ldr.svg",48*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/analog_signal.svg", 20*options.zoom, 20*options.zoom))
				.setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.analog),'PIN');
			this.appendStatementInput('HIGH').appendField(new Blockly.FieldImage("img/blocks/sun.svg",20*options.zoom,20*options.zoom))
				.appendField(new Blockly.FieldTextInput(""),'light_high')
				.appendField(new Blockly.FieldLabel("%"))
			this.appendStatementInput('LOW').appendField(new Blockly.FieldImage("img/blocks/moon.svg",20*options.zoom,20*options.zoom))
				.appendField(new Blockly.FieldTextInput(""),'light_low')
				.appendField(new Blockly.FieldLabel("%"))
			this.setInputsInline(true);
			this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
			
            this.setTooltip(Facilino.locales.getKey('LANG_LIGHT_SENSOR_TOOLTIP'));
            }
        };
		
		
		Blockly.Arduino.ambient_humid_humiditySoil = function() {
			var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            Blockly.Arduino.setups_['setup_analog_read' + dropdown_pin] = JST['inout_analog_read_setups']({'dropdown_pin': dropdown_pin});
            code = JST['inout_analog_read']({'dropdown_pin': dropdown_pin});
            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

		Blockly.Blocks.ambient_humid_humiditySoil = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_HUMID_READ_HUMID_SOIL_TOOLTIP'],
			output: 'number',
            init: function() {
			this.setColour(Facilino.LANG_COLOUR_AMBIENT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/humidity_analog.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/soil.svg",48*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/analog_signal.svg", 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.analog),'PIN');
			this.setInputsInline(true);
			this.setPreviousStatement(false);
            this.setNextStatement(false);
			this.setOutput(true,Number);
            this.setTooltip(Facilino.locales.getKey('LANG_HUMID_READ_HUMID_SOIL_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.ambient_humid_humiditySoil_alarm = function() {
				var code = '';
				var dropdown_pin = this.getFieldValue('PIN');
				Blockly.Arduino.setups_['setup_analog_read' + dropdown_pin] = JST['inout_analog_read_setups']({'dropdown_pin': dropdown_pin});
				var hum_high = this.getFieldValue('hum_high');
				var hum_high_c = (hum_high * 1023)/100;
				var high = Blockly.Arduino.statementToCode(this,'HIGH') || '';
				var hum_low = this.getFieldValue('hum_low');
				var hum_low_c = (hum_low * 1023)/100;
				var low = Blockly.Arduino.statementToCode(this,'LOW') || '';
				var codehigh = 'else{\n'+indentSentences(high)+'\n}\n';
				var codelow = 'if('+JST['inout_analog_read']({'dropdown_pin': dropdown_pin})+'<'+hum_low_c+'){\n'+indentSentences(low)+'\n}\n';
				code += codelow + codehigh;
				return [code,Blockly.Arduino.CODE_ATOMIC];

        };

		Blockly.Blocks.ambient_humid_humiditySoil_alarm = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_TEMP_READ_TEMP_DHT_TOOLTIP'],
			output: 'number',
            init: function() {
			this.setColour(Facilino.LANG_COLOUR_AMBIENT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/humidity_analog.svg",20*options.zoom,20*options.zoom))
				.appendField(new Blockly.FieldImage("img/blocks/soil.svg",48*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/analog_signal.svg", 20*options.zoom, 20*options.zoom))
				.setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.analog),'PIN');
			this.appendStatementInput('HIGH').appendField(new Blockly.FieldImage("img/blocks/humidity_high.svg",20*options.zoom,20*options.zoom))
				.appendField(new Blockly.FieldTextInput(""),'hum_high')
				.appendField(new Blockly.FieldLabel("%"))
			this.appendStatementInput('LOW').appendField(new Blockly.FieldImage("img/blocks/humidity_low.svg",20*options.zoom,20*options.zoom))
				.appendField(new Blockly.FieldTextInput(""),'hum_low')
				.appendField(new Blockly.FieldLabel("%"))
			this.setInputsInline(true);
			this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
			
            this.setTooltip(Facilino.locales.getKey('LANG_TEMP_READ_TEMP_DHT_TOOLTIP'));
            }
        };
		Blockly.Arduino.ambient_raindrop = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            code += JST['inout_analog_read']({'dropdown_pin': dropdown_pin});
            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };
		
		Blockly.Blocks.ambient_raindrop = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_RAINDROP_ANALOG_TOOLTIP'],
			output: 'number',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_AMBIENT);
				this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/rain.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/yl_83.svg',20*options.zoom,20*options.zoom));
                this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/analog_signal.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.analog),'PIN');
                this.setOutput(true, Number);
				this.setInputsInline(true);
				this.setPreviousStatement(false);
				this.setNextStatement(false);
                this.setTooltip(Facilino.locales.getKey('LANG_RAINDROP_ANALOG_TOOLTIP'));
            }
        };

		Blockly.Arduino.ambient_raindrop_digital = function() {
            var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            Blockly.Arduino.setups_['setup_green_digital_read' + dropdown_pin] = JST['inout_digital_read_setups']({'dropdown_pin': dropdown_pin});
            code += JST['inout_digital_read']({'dropdown_pin': dropdown_pin});
			return [code, Blockly.Arduino.ORDER_ATOMIC];
        };


        Blockly.Blocks.ambient_raindrop_digital = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_RAINDROP_DIGITAL_TOOPTIP'],
			output: 'boolean',
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_AMBIENT);
				this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/rain.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/yl_83.svg',20*options.zoom,20*options.zoom));
                this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
                this.setOutput(true, Boolean);
				this.setInputsInline(true);
				this.setPreviousStatement(false);
				this.setNextStatement(false);
                this.setTooltip(Facilino.locales.getKey('LANG_RAINDROP_DIGITAL_TOOPTIP'));
            }
        };
		
		Blockly.Arduino.ambient_gas_analog_read = function() {
			var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            code += JST['inout_analog_read']({'dropdown_pin': dropdown_pin});
            return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

		Blockly.Blocks.ambient_gas_analog_read = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_GAS_ANALOG_READ_TOOLTIP'],
			output: 'number',
            init: function() {
			this.setColour(Facilino.LANG_COLOUR_AMBIENT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/co2.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/gas.svg',20*options.zoom,20*options.zoom));
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/analog_signal.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.analog),'PIN');
			this.setInputsInline(true);
			this.setPreviousStatement(false);
            this.setNextStatement(false);
			this.setOutput(true,Number);
            this.setTooltip(Facilino.locales.getKey('LANG_GAS_ANALOG_READ_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.ambient_gas_digital_read = function() {
			var dropdown_pin = this.getFieldValue('PIN');
            var code = '';
            Blockly.Arduino.setups_['setup_green_digital_read' + dropdown_pin] = JST['inout_digital_read_setups']({'dropdown_pin': dropdown_pin});
            code += JST['inout_digital_read']({'dropdown_pin': dropdown_pin});
			return [code, Blockly.Arduino.ORDER_ATOMIC];
        };

		Blockly.Blocks.ambient_gas_digital_read = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_GAS_DIGITAL_READ_TOOLTIP'],
			output: 'boolean',
            init: function() {
			this.setColour(Facilino.LANG_COLOUR_AMBIENT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/co2.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage('img/blocks/gas.svg',20*options.zoom,20*options.zoom));
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/digital_signal.svg", 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
			this.setInputsInline(true);
			this.setPreviousStatement(false);
            this.setNextStatement(false);
			this.setOutput(true,Boolean);
            this.setTooltip(Facilino.locales.getKey('LANG_GAS_DIGITAL_READ_TOOLTIP'));
            }
        };
		
				
		
		Blockly.Arduino.ambient_pressure_pressureBMP180 = function() {
				var code = '';
				Blockly.Arduino.definitions_['wire']=JST['wire_definitions_include']({});
				Blockly.Arduino.definitions_['bmp']=JST['bmp_definitions_include']({});
				Blockly.Arduino.definitions_['declare_var_define_bmp']='Adafruit_BMP085 bmp;\n';
				Blockly.Arduino.setups_['setup_bmp'] = 'bmp.begin();\n';
				code += 'bmp.readPressure()'
				return [code,Blockly.Arduino.CODE_ATOMIC];
        };

		Blockly.Blocks.ambient_pressure_pressureBMP180 = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_PRESSURE_READ_PRESSURE_BMP_TOOLTIP'],
			output: 'number',
            init: function() {
			this.setColour(Facilino.LANG_COLOUR_AMBIENT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/barometer.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/bmp180.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			this.setInputsInline(true);
			this.setPreviousStatement(false);
            this.setNextStatement(false);
			this.setOutput(true,Number);
            this.setTooltip(Facilino.locales.getKey('LANG_PRESSURE_READ_PRESSURE_BMP_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.ambient_temp_pressureBMP180 = function() {
				var code = '';
				Blockly.Arduino.definitions_['wire']=JST['wire_definitions_include']({});
				Blockly.Arduino.definitions_['bmp']=JST['bmp_definitions_include']({});
				Blockly.Arduino.definitions_['declare_var_define_bmp']='Adafruit_BMP085 bmp;\n';
				Blockly.Arduino.setups_['setup_bmp'] = 'bmp.begin();\n';
				
				code += 'bmp.readTemperature()'
				return [code,Blockly.Arduino.CODE_ATOMIC];
        };

		Blockly.Blocks.ambient_temp_pressureBMP180 = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_TEMP_READ_TEMP_BMP_TOOLTIP'],
			output: 'number',
            init: function() {
			this.setColour(Facilino.LANG_COLOUR_AMBIENT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/thermometer.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/bmp180.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			this.setInputsInline(true);
			this.setPreviousStatement(false);
            this.setNextStatement(false);
			this.setOutput(true,Number);
            this.setTooltip(Facilino.locales.getKey('LANG_TEMP_READ_TEMP_BMP_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.ambient_altitude_pressureBMP180 = function() {
				var code = '';
				var pressure = '101325';
				Blockly.Arduino.definitions_['wire']=JST['wire_definitions_include']({});
				Blockly.Arduino.definitions_['bmp']=JST['bmp_definitions_include']({});
				Blockly.Arduino.definitions_['declare_var_define_bmp']='Adafruit_BMP085 bmp;\n';
				Blockly.Arduino.setups_['setup_bmp'] = 'bmp.begin();\n';
				
				code += 'bmp.readAltitude('+pressure+')';
				return [code,Blockly.Arduino.CODE_ATOMIC];
        };

		Blockly.Blocks.ambient_altitude_pressureBMP180 = {
            category: Facilino.locales.getKey('LANG_CATEGORY_AMBIENT'),
            category_colour: Facilino.LANG_COLOUR_AMBIENT,
			colour: Facilino.LANG_COLOUR_AMBIENT,
			keys: ['LANG_ALTITUDE_READ_ALTITUDE_BMP_TOOLTIP'],
			output: 'number',
            init: function() {
			this.setColour(Facilino.LANG_COLOUR_AMBIENT);
			this.appendDummyInput('').appendField(new Blockly.FieldImage("img/blocks/altitude.svg",20*options.zoom,20*options.zoom)).appendField(new Blockly.FieldImage("img/blocks/bmp180.svg",20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
			this.setInputsInline(true);
			this.setPreviousStatement(false);
            this.setNextStatement(false);
			this.setOutput(true,Number);
            this.setTooltip(Facilino.locales.getKey('LANG_ALTITUDE_READ_ALTITUDE_BMP_TOOLTIP'));
            }
        };
		
		Blockly.Arduino.oled_display = function() {
				var content1 = this.getFieldValue('CONTENT1');
				var content2 = Blockly.Arduino.valueToCode(this, 'CONTENT2', Blockly.Arduino.ORDER_ATOMIC);
				var dropdown_pin_size = this.getFieldValue('SIZE');
				var dropdown_pin_altura = this.getFieldValue('ALTURA');
				var code = '';
				Blockly.Arduino.definitions_['oled_include']=JST['oled_definitions_include']({});
				Blockly.Arduino.definitions_['oled_define']=JST['oled_definitions_define']({});
				Blockly.Arduino.definitions_['wire']=JST['wire_definitions_include']({});
				Blockly.Arduino.definitions_['spi']=JST['spi_definitions_include']({});
				Blockly.Arduino.setups_['setup_oled']=JST['oled_setups']({});
				code +='\ndisplay.setTextSize(' +dropdown_pin_size+ ');\ndisplay.setTextColor(WHITE);\ndisplay.setCursor(1,'+dropdown_pin_altura+');\ndisplay.print("'+content1+'");\ndisplay.println('+content2+');\n'	
				return code;
				};

		Blockly.Blocks.oled_display = {
					category: Facilino.locales.getKey('LANG_CATEGORY_SCREEN'),
					category_colour: Facilino.LANG_COLOUR_SCREEN,
					colour: Facilino.LANG_COLOUR_SCREEN,
					keys: ['LANG_OLED_DISPLAY_TOOLTIP','LANG_OLED_SIZE_SMALL','LANG_OLED_SIZE_MEDIUM','LANG_OLED_SIZE_BIG','LANG_OLED_POSITION_UP','LANG_OLED_POSITION_MIDDLE','LANG_OLED_POSITION_DOWN'],
					init: function() {
						this.setColour(Facilino.LANG_COLOUR_SCREEN);
						var size = [[Facilino.locales.getKey('LANG_OLED_SIZE_SMALL'),'1'],[Facilino.locales.getKey('LANG_OLED_SIZE_MEDIUM'), '2'],[Facilino.locales.getKey('LANG_OLED_SIZE_BIG'),'3']];
						var altura = [[Facilino.locales.getKey('LANG_OLED_POSITION_UP'),'1'],[Facilino.locales.getKey('LANG_OLED_POSITION_MIDDLE'), '10'],[Facilino.locales.getKey('LANG_OLED_POSITION_DOWN'),'20']];
						this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/oled_display.svg',36*options.zoom, 20*options.zoom))
							.appendField(new Blockly.FieldDropdown(size),'SIZE')
							.appendField(new Blockly.FieldDropdown(altura),'ALTURA').setAlign(Blockly.ALIGN_RIGHT)
							.appendField(new Blockly.FieldImage('img/blocks/text.svg',24*options.zoom,24*options.zoom))
							.appendField(new Blockly.FieldTextInput("    "),'CONTENT1')
							.appendField(new Blockly.FieldImage('img/blocks/numbers.svg',20*options.zoom,20*options.zoom));
						this.appendValueInput('CONTENT2', String);
						this.appendDummyInput('SIZE');
						this.setInputsInline(true);
						this.setPreviousStatement(true,'code');	
						this.setNextStatement(true,'code');
						this.setTooltip(Facilino.locales.getKey('LANG_OLED_DISPLAY_TOOLTIP'));
					}
				};
		Blockly.Arduino.oled_1_display = function() {
				var content = Blockly.Arduino.valueToCode(this, 'CONTENT1', Blockly.Arduino.ORDER_ATOMIC);
				var dropdown_pin_size = this.getFieldValue('SIZE');
				var dropdown_pin_altura = this.getFieldValue('ALTURA');
				var code = '';
				Blockly.Arduino.definitions_['oled_include']=JST['oled_definitions_include']({});
				Blockly.Arduino.definitions_['oled_define']=JST['oled_definitions_define']({});
				Blockly.Arduino.definitions_['wire']=JST['wire_definitions_include']({});
				Blockly.Arduino.definitions_['spi']=JST['spi_definitions_include']({});
				Blockly.Arduino.setups_['setup_oled']=JST['oled_setups']({});
				code +='\ndisplay.setTextSize(' +dropdown_pin_size+ ');\ndisplay.setTextColor(WHITE);\ndisplay.setCursor(1,'+dropdown_pin_altura+');\ndisplay.print('+content+');\ndisplay.display();\ndisplay.clearDisplay();\ndelay(250);\n'	
				return code;
				};

		Blockly.Blocks.oled_1_display = {
					category: Facilino.locales.getKey('LANG_CATEGORY_SCREEN'),
					category_colour: Facilino.LANG_COLOUR_SCREEN,
					colour: Facilino.LANG_COLOUR_SCREEN,
					keys: ['LANG_OLED_DISPLAY_TOOLTIP','LANG_OLED_SIZE_SMALL','LANG_OLED_SIZE_MEDIUM','LANG_OLED_SIZE_BIG','LANG_OLED_POSITION_UP','LANG_OLED_POSITION_MIDDLE','LANG_OLED_POSITION_DOWN'],
					init: function() {
						this.setColour(Facilino.LANG_COLOUR_SCREEN);
						var size = [[Facilino.locales.getKey('LANG_OLED_SIZE_SMALL'),'1'],[Facilino.locales.getKey('LANG_OLED_SIZE_MEDIUM'), '2'],[Facilino.locales.getKey('LANG_OLED_SIZE_BIG'),'3']];
						var altura = [[Facilino.locales.getKey('LANG_OLED_POSITION_UP'),'1'],[Facilino.locales.getKey('LANG_OLED_POSITION_MIDDLE'), '10'],[Facilino.locales.getKey('LANG_OLED_POSITION_DOWN'),'20']];
						this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/oled_display.svg',36*options.zoom, 20*options.zoom))
							.appendField(new Blockly.FieldDropdown(size),'SIZE')
							.appendField(new Blockly.FieldDropdown(altura),'ALTURA').setAlign(Blockly.ALIGN_RIGHT)
							.appendField(new Blockly.FieldImage('img/blocks/text.svg', 24*options.zoom, 24*options.zoom))
							//.appendField(new Blockly.FieldTextInput("    "),'CONTENT1')
						this.appendValueInput('CONTENT1', String);
						this.appendDummyInput('Size');
						this.setInputsInline(true);
						this.setPreviousStatement(true,'code');	
						this.setNextStatement(true,'code');
						this.setTooltip(Facilino.locales.getKey('LANG_OLED_DISPLAY_TOOLTIP'));
					}
				};
				
		Blockly.Arduino.oled_2_display = function() {
				var content2 = Blockly.Arduino.valueToCode(this, 'CONTENT2', Blockly.Arduino.ORDER_ATOMIC);
				var dropdown_pin_size = this.getFieldValue('SIZE');
				var dropdown_pin_altura = this.getFieldValue('ALTURA');
				var code = '';
				Blockly.Arduino.definitions_['oled_include']=JST['oled_definitions_include']({});
				Blockly.Arduino.definitions_['oled_define']=JST['oled_definitions_define']({});
				Blockly.Arduino.definitions_['wire']=JST['wire_definitions_include']({});
				Blockly.Arduino.definitions_['spi']=JST['spi_definitions_include']({});
				Blockly.Arduino.setups_['setup_oled']=JST['oled_setups']({});
				code +='\ndisplay.setTextSize(' +dropdown_pin_size+ ');\ndisplay.setTextColor(WHITE);\ndisplay.setCursor(1,'+dropdown_pin_altura+');\ndisplay.println('+content2+');'	
				return code;
				};

		Blockly.Blocks.oled_2_display = {
					category: Facilino.locales.getKey('LANG_CATEGORY_SCREEN'),
					category_colour: Facilino.LANG_COLOUR_SCREEN,
					colour: Facilino.LANG_COLOUR_SCREEN,
					keys: ['LANG_OLED_DISPLAY_TOOLTIP','LANG_OLED_SIZE_SMALL','LANG_OLED_SIZE_MEDIUM','LANG_OLED_SIZE_BIG','LANG_OLED_POSITION_UP','LANG_OLED_POSITION_MIDDLE','LANG_OLED_POSITION_DOWN'],
					init: function() {
						this.setColour(Facilino.LANG_COLOUR_SCREEN);
						var size = [[Facilino.locales.getKey('LANG_OLED_SIZE_SMALL'),'1'],[Facilino.locales.getKey('LANG_OLED_SIZE_MEDIUM'), '2'],[Facilino.locales.getKey('LANG_OLED_SIZE_BIG'),'3']];
						var altura = [[Facilino.locales.getKey('LANG_OLED_POSITION_UP'),'1'],[Facilino.locales.getKey('LANG_OLED_POSITION_MIDDLE'), '10'],[Facilino.locales.getKey('LANG_OLED_POSITION_DOWN'),'20']];
						this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/oled_display.svg',36*options.zoom, 20*options.zoom))
							.appendField(new Blockly.FieldDropdown(size),'SIZE')
							.appendField(new Blockly.FieldDropdown(altura),'ALTURA').setAlign(Blockly.ALIGN_RIGHT)
							.appendField(new Blockly.FieldImage('img/blocks/numbers.svg',20*options.zoom,20*options.zoom));
						this.appendValueInput('CONTENT2', String);
						this.appendDummyInput('Size');
						this.setInputsInline(true);
						this.setPreviousStatement(true,'code');	
						this.setNextStatement(true,'code');
						this.setTooltip(Facilino.locales.getKey('LANG_OLED_DISPLAY_TOOLTIP'));
					}
				};		
		
		Blockly.Arduino.controls_oled = function() {
			var content1 = Blockly.Arduino.valueToCode(this, 'CONTENT1', Blockly.Arduino.ORDER_ATOMIC);
			var dropdown_pin_size = this.getFieldValue('SIZE');
			var dropdown_pin_altura = this.getFieldValue('ALTURA');
            var n = 0;            
            var code = '';			
			Blockly.Arduino.definitions_['oled_include']=JST['oled_definitions_include']({});
			Blockly.Arduino.definitions_['oled_define']=JST['oled_definitions_define']({});
			Blockly.Arduino.definitions_['wire']=JST['wire_definitions_include']({});
			Blockly.Arduino.definitions_['spi']=JST['spi_definitions_include']({});
			Blockly.Arduino.setups_['setup_oled']=JST['oled_setups']({});
            code += JST['controls_txt_oled']({
                'dropdown_pin_size': dropdown_pin_size,
                'dropdown_pin_altura': dropdown_pin_altura,
				'content1': content1
            });

            if (this.elseCount_) {
			  var content2 = Blockly.Arduino.valueToCode(this, 'txt2', Blockly.Arduino.ORDER_ATOMIC);
                code += JST['controls_txt2_oled']({
                    'content2': content2
                });
            }	
            return code + '\n';
        };

        Blockly.Blocks.controls_oled = {
            category: Facilino.locales.getKey('LANG_CATEGORY_SCREEN'),
			category_colour: Facilino.LANG_COLOUR_SCREEN,
			colour: Facilino.LANG_COLOUR_SCREEN,
			keys: ['LANG_OLED_DISPLAY_TOOLTIP','LANG_OLED_SIZE_SMALL','LANG_OLED_SIZE_MEDIUM','LANG_OLED_SIZE_BIG','LANG_OLED_POSITION_UP','LANG_OLED_POSITION_MIDDLE','LANG_OLED_POSITION_DOWN'],
			init: function() {
                this.setColour(Facilino.LANG_COLOUR_SCREEN);
				var size = [[Facilino.locales.getKey('LANG_OLED_SIZE_SMALL'),'1'],[Facilino.locales.getKey('LANG_OLED_SIZE_MEDIUM'), '2'],[Facilino.locales.getKey('LANG_OLED_SIZE_BIG'),'3']];
				var altura = [[Facilino.locales.getKey('LANG_OLED_POSITION_UP'),'1'],[Facilino.locales.getKey('LANG_OLED_POSITION_MIDDLE'), '10'],[Facilino.locales.getKey('LANG_OLED_POSITION_DOWN'),'20']];
						this.appendValueInput('CONTENT1').appendField(new Blockly.FieldImage("img/blocks/oled_display.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldImage("img/blocks/numbers.svg",20*options.zoom,20*options.zoom))
							.appendField(new Blockly.FieldDropdown(size),'SIZE')
							.appendField(new Blockly.FieldDropdown(altura),'ALTURA').setAlign(Blockly.ALIGN_RIGHT);						
						this.appendDummyInput('Size');
						this.setInputsInline(true);
						this.setPreviousStatement(true,'code');	
						this.setNextStatement(true,'code');
						this.setMutator(new Blockly.Mutator(['controls_if_txt2']));
						var thisBlock = this;
						this.setTooltip(Facilino.locales.getKey('LANG_OLED_DISPLAY_TOOLTIP'));                
						this.elseCount_ = 0;
						this.setTooltip(Facilino.locales.getKey('LANG_OLED_DISPLAY_TOOLTIP'));
            },
            mutationToDom: function() {
                if (!this.elseCount_) {
                    return null;
                }
                var container = document.createElement('mutation');                
                if (this.elseCount_) {
                    container.setAttribute('txt2', 1);
                }
                return container;
            },
            domToMutation: function(xmlElement) {
                this.elseCount_ = window.parseInt(xmlElement.getAttribute('txt2'), 10);
                if (this.elseCount_) {
					this.appendValueInput('txt2');
					this.appendDummyInput('txt2_LABEL');
				}
            },
            decompose: function(workspace) {
                var containerBlock = workspace.newBlock('controls_oled_1');
                containerBlock.initSvg();
                var connection = containerBlock.getInput('CONTENT').connection;
                if (this.elseCount_) {
                    var elseBlock = workspace.newBlock('controls_if_txt2');
                    elseBlock.initSvg();
                    connection.connect(elseBlock.previousConnection);
                }
                return containerBlock;
            },
            compose: function(containerBlock) {
                if (this.elseCount_) {
					this.removeInput('txt2_LABEL');
                    this.removeInput('txt2');
                }
                this.elseCount_ = 0;
                var clauseBlock = containerBlock.getInputTargetBlock('CONTENT');
                while (clauseBlock) {
                    switch (clauseBlock.type) {                        
                        case 'controls_if_txt2':
                            this.elseCount_++;							
							this.appendDummyInput('txt2_LABEL')//.appendField(new Blockly.FieldImage("img/blocks/decision_end.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
                            var elseInput = this.appendValueInput('txt2');//.setCheck('code');
							if (clauseBlock.statementConnection_) {
                                elseInput.connection.connect(clauseBlock.statementConnection_);
                            }
                            break;
                        default:
                            throw 'Unknown block type.';
                    }
                    clauseBlock = clauseBlock.nextConnection &&
                        clauseBlock.nextConnection.targetBlock();
                }
            },
            saveConnections: function(containerBlock) {
                var clauseBlock = containerBlock.getInputTargetBlock('CONTENT');
                var x = 1;
                while (clauseBlock) {
                    switch (clauseBlock.type) {                        
                        case 'controls_if_txt2':
                            inputDo = this.getInput('txt2');
                            clauseBlock.statementConnection_ =
                                inputDo && inputDo.connection.targetConnection;
                            break;
                        default:
                            throw 'Unknown block type.';
                    }
                    clauseBlock = clauseBlock.nextConnection &&
                        clauseBlock.nextConnection.targetBlock();
                }
            }
        };
		//HEMBRA
        Blockly.Blocks.controls_oled_1 = {
			colour: Facilino.LANG_COLOUR_CONTROL,
			keys: ['LANG_OLED_DISPLAY_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_SCREEN);
				//IMAGEN
                this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/plus.svg",10*options.zoom, 10*options.zoom))
				this.appendValueInput('CONTENT', String);				
                this.setNextStatement(true,'code');
				
                this.setTooltip(Facilino.locales.getKey('LANG_OLED_DISPLAY_TOOLTIP'));
                this.contextMenu = false;
            }
        };

		//MACHO
        Blockly.Blocks.controls_if_txt2 = {
            colour: Facilino.LANG_COLOUR_CONTROL,
			keys: ['LANG_OLED_DISPLAY_TOOLTIP'],
            init: function() {
                this.setColour(Facilino.LANG_COLOUR_SCREEN);
                this.appendDummyInput().appendField(new Blockly.FieldImage("img/blocks/text.svg",20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
				this.setOutput(true, String);
				
				this.setTooltip(Facilino.locales.getKey('LANG_OLED_DISPLAY_TOOLTIP'));
                this.contextMenu = false;
            }
        };
		
		Blockly.Arduino.oled_clear = function() {
				var content = Blockly.Arduino.valueToCode(this, 'CONTENT', Blockly.Arduino.ORDER_ATOMIC);
				var code = '';
				code +='\ndisplay.display();\ndisplay.clearDisplay();\ndelay(250);\n'
				return code;
				};

		Blockly.Blocks.oled_clear = {
					category: Facilino.locales.getKey('LANG_CATEGORY_SCREEN'),
					category_colour: Facilino.LANG_COLOUR_SCREEN,
					colour: Facilino.LANG_COLOUR_SCREEN,
					keys: ['LANG_OLED_CLEAR_TOOLTIP'],
					init: function() {
						this.setColour(Facilino.LANG_COLOUR_SCREEN);
						this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/oled_display.svg',36*options.zoom, 20*options.zoom)).appendField(new Blockly.FieldImage('img/blocks/escoba.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT);
						this.setInputsInline(true);
						this.setPreviousStatement(true,'code');	
						this.setNextStatement(true,'code');
						this.setTooltip(Facilino.locales.getKey('LANG_OLED_CLEAR_TOOLTIP'));
					}
				};		
				
				
			Blockly.Arduino['led_strip'] = function(block) {
			  var pixels = Blockly.Arduino.valueToCode(this,'PIXELS',Blockly.Arduino.ORDER_ATOMIC) || '';
			  var input_pin = this.getFieldValue('PIN');
			  Blockly.Arduino.definitions_['define_neopixel_h'] = '#include <Adafruit_NeoPixel.h>';
			  Blockly.Arduino.definitions_['define_avr_power_h'] = '#ifdef __AVR__\n  #include <avr/power.h>\n#endif';
			  Blockly.Arduino.definitions_['declare_var_led_strip_'+input_pin]='Adafruit_NeoPixel _led_strip_'+input_pin+'('+pixels+','+input_pin+', NEO_GRB + NEO_KHZ800);\n';

			  Blockly.Arduino.setups_['setup_simpleexpressions_led_strip'+input_pin] = '_led_strip_'+input_pin+'.begin();\n  clearpixels_'+input_pin+'();\n  _led_strip_'+input_pin+'.setBrightness(map(10,0,100,0,255));\n';
			  
			  Blockly.Arduino.definitions_['define_clearpixels'+input_pin]='void clearpixels_'+input_pin+'()\n{\n  uint16_t n=_led_strip_'+input_pin+'.numPixels();\n  for(uint16_t i = 0; i < n; i++) {\n    _led_strip_'+input_pin+'.setPixelColor(i, 0);\n  }\n  delay(1);\n}\n';
			  Blockly.Arduino.definitions_['define_writepixel'+input_pin]='void writepixel_'+input_pin+'(uint16_t pixel, int r, int g, int b)\n{ _led_strip_'+input_pin+'.setPixelColor(pixel, _led_strip_'+input_pin+'.Color(r, g, b));\n  _led_strip_'+input_pin+'.show();\n}\n';
			  var code ='';
			  
			  try{
			    for (var i=0;i<pixels;i++)
				  {
					  var input_color = this.getFieldValue('COLOR'+i);
					  var color_rgb=Facilino.hexToRgb(input_color);
					  code+='writepixel_'+input_pin+'('+i+','+color_rgb.r +','+color_rgb.g+','+color_rgb.b+');\n';
				  }
			  }
			  catch(e)
			  {}
			  return code;
			};
			
			Blockly.Blocks['led_strip'] = {
			  category: Facilino.locales.getKey('LANG_CATEGORY_LIGHT'),
			  category_colour: Facilino.LANG_COLOUR_LIGHT,
			  colour: Facilino.LANG_COLOUR_LIGHT,
			  keys: ['LANG_SIMPLEEXPRESSIONS_LED_STRIP_TOOLTIP'],
			  init: function() {
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/led_strip.svg',20*options.zoom,20*options.zoom));
				this.appendDummyInput('PIN').appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg', 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
				this.appendValueInput('PIXELS').appendField(new Blockly.FieldImage('img/blocks/led_pixel.svg',20*options.zoom,20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck(Number);
				this.setPreviousStatement(true,'code');
				this.setNextStatement(true,'code');
				this.setInputsInline(true);
				this.setColour(Facilino.LANG_COLOUR_LIGHT);
				this.setTooltip(Facilino.locales.getKey('LANG_SIMPLEEXPRESSIONS_LED_STRIP_TOOLTIP'));
				this.numPixels=0;
			  },
			  onchange: function() {
				  var numLEDPixels = this.getInputTargetBlock('PIXELS');
				  if (numLEDPixels!==null)
				  {
					  if (numLEDPixels.type==='math_number')
					  {
						  if (numLEDPixels.getFieldValue('NUM')!==this.numPixels)
						  {
							  this.numPixels=numLEDPixels.getFieldValue('NUM');
							  for (var i=0;i<this.numPixels;i++)
							  {
								  try{
									  this.removeField('COLOR'+i);
								  }
								  catch(e)
								  {
								  }
								  var colour = new Blockly.FieldColour('#000000');
								  colour.setColours(['#000000','#808080','#C0C0C0','#FFFFFF','#800000','#FF0000','#808000','#FFFF00','#008000','#00FF00','#008080','#00FFFF','#000080','#0000FF','#800080','#FF00FF']).setColumns(4);
								  this.appendDummyInput('').appendField(colour,'COLOR'+i).setAlign(Blockly.ALIGN_RIGHT);
							  }
						  }
					  }
				  }
			  }
			};
			
			Blockly.Arduino['led_strip_brightness'] = function(block) {
			  var brightness = Blockly.Arduino.valueToCode(this,'BRIGHTNESS',Blockly.Arduino.ORDER_ATOMIC) || '';
			  var input_pin = this.getFieldValue('PIN');
			  Blockly.Arduino.definitions_['define_neopixel_h'] = '#include <Adafruit_NeoPixel.h>';
			  Blockly.Arduino.definitions_['define_avr_power_h'] = '#ifdef __AVR__\n  #include <avr/power.h>\n#endif';
			  Blockly.Arduino.definitions_['declare_var_led_strip_'+input_pin]='Adafruit_NeoPixel _led_strip_'+input_pin+'(7,'+input_pin+', NEO_GRB + NEO_KHZ800);\n';

			  Blockly.Arduino.setups_['setup_simpleexpressions_led_strip'+input_pin] = '_led_strip_'+input_pin+'.begin();\n  clearpixels_'+input_pin+'();\n  _led_strip_'+input_pin+'.setBrightness(map(10,0,100,0,255));\n';
			  
			  var code='_led_strip_'+input_pin+'.setBrightness(map('+brightness+',0,100,0,255));\n' ;
			  return code;
			};
			
			Blockly.Blocks['led_strip_brightness'] = {
			  category: Facilino.locales.getKey('LANG_CATEGORY_LIGHT'),
			  category_colour: Facilino.LANG_COLOUR_LIGHT,
			  colour: Facilino.LANG_COLOUR_LIGHT,
			  keys: ['LANG_SIMPLEEXPRESSIONS_LED_STRIP_BRIGHTNESS_TOOLTIP'],
			  init: function() {
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/led_strip.svg',20*options.zoom,20*options.zoom));
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/digital_signal.svg', 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown(profiles.default.digital),'PIN');
				this.appendValueInput('BRIGHTNESS').appendField(new Blockly.FieldImage('img/blocks/sun.svg', 20*options.zoom, 20*options.zoom)).setAlign(Blockly.ALIGN_RIGHT).setCheck(Number);
				this.appendDummyInput('').appendField(new Blockly.FieldImage('img/blocks/percent.svg',20*options.zoom,20*options.zoom));
				this.setPreviousStatement(true,'code');
				this.setNextStatement(true,'code');
				this.setInputsInline(true);
				this.setColour(Facilino.LANG_COLOUR_LIGHT);
				this.setTooltip(Facilino.locales.getKey('LANG_SIMPLEEXPRESSIONS_LED_STRIP_BRIGHTNESS_TOOLTIP'));
			  }
			};
		
        return Blockly.Blocks;
    }

var Facilino = {
        load: load
    };
    if (typeof define === 'function' && define.amd) {
        return Facilino;
    } else {
        window.Facilino = Facilino;
    }
}));