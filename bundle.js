(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
	Tree Kit
	
	Copyright (c) 2014 - 2016 Cédric Ronvel
	
	The MIT License (MIT)
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



/*
	Stand-alone fork of extend.js, without options.
*/

module.exports = function clone( originalObject , circular )
{
	// First create an empty object with
	// same prototype of our original source
	
	var propertyIndex , descriptor , keys , current , nextSource , indexOf ,
		copies = [ {
			source: originalObject ,
			target: Array.isArray( originalObject ) ? [] : Object.create( Object.getPrototypeOf( originalObject ) )
		} ] ,
		cloneObject = copies[ 0 ].target ,
		sourceReferences = [ originalObject ] ,
		targetReferences = [ cloneObject ] ;
	
	// First in, first out
	while ( current = copies.shift() )	// jshint ignore:line
	{
		keys = Object.getOwnPropertyNames( current.source ) ;

		for ( propertyIndex = 0 ; propertyIndex < keys.length ; propertyIndex ++ )
		{
			// Save the source's descriptor
			descriptor = Object.getOwnPropertyDescriptor( current.source , keys[ propertyIndex ] ) ;
			
			if ( ! descriptor.value || typeof descriptor.value !== 'object' )
			{
				Object.defineProperty( current.target , keys[ propertyIndex ] , descriptor ) ;
				continue ;
			}
			
			nextSource = descriptor.value ;
			descriptor.value = Array.isArray( nextSource ) ? [] : Object.create( Object.getPrototypeOf( nextSource ) ) ;
			
			if ( circular )
			{
				indexOf = sourceReferences.indexOf( nextSource ) ;
				
				if ( indexOf !== -1 )
				{
					// The source is already referenced, just assign reference
					descriptor.value = targetReferences[ indexOf ] ;
					Object.defineProperty( current.target , keys[ propertyIndex ] , descriptor ) ;
					continue ;
				}
				
				sourceReferences.push( nextSource ) ;
				targetReferences.push( descriptor.value ) ;
			}
			
			Object.defineProperty( current.target , keys[ propertyIndex ] , descriptor ) ;
			
			copies.push( { source: nextSource , target: descriptor.value } ) ;
		}
	}
	
	return cloneObject ;
} ;

},{}],2:[function(require,module,exports){
/*
	Tree Kit
	
	Copyright (c) 2014 - 2016 Cédric Ronvel
	
	The MIT License (MIT)
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



/*
	== Diff function ==
*/

function diff( left , right , options )
{
	var i , key , keyPath ,
		leftKeys , rightKeys , leftTypeof , rightTypeof ,
		depth , diffObject , length , arrayMode ;
	
	leftTypeof = typeof left ;
	rightTypeof = typeof right ;
	
	if (
		! left || ( leftTypeof !== 'object' && leftTypeof !== 'function' ) ||
		! right || ( rightTypeof !== 'object' && rightTypeof !== 'function' )
	)
	{
		throw new Error( '[tree] diff() needs objects as argument #0 and #1' ) ;
	}
	
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	depth = options.depth || 0 ;
	
	// Things applied only for the root, not for recursive call
	if ( ! depth )
	{
		options.diffObject = {} ;
		if ( ! options.path ) { options.path = '' ; }
		if ( ! options.pathSeparator ) { options.pathSeparator = '.' ; }
	}
	
	diffObject = options.diffObject ;
	
	
	// Left part
	if ( Array.isArray( left ) )
	{
		arrayMode = true ;
		length = left.length ;
	}
	else
	{
		arrayMode = false ;
		leftKeys = Object.keys( left ) ;
		length = leftKeys.length ;
	}
	
	for ( i = 0 ; i < length ; i ++ )
	{
		key = arrayMode ? i : leftKeys[ i ] ;
		keyPath = options.path + options.pathSeparator + key ;
		//console.log( 'L keyPath:' , keyPath ) ;
		
		if ( ! right.hasOwnProperty( key ) )
		{
			diffObject[ keyPath ] = { path: keyPath , message: 'does not exist in right-hand side' } ;
			continue ;
		}
		
		leftTypeof = typeof left[ key ] ;
		rightTypeof = typeof right[ key ] ;
		
		if ( leftTypeof !== rightTypeof )
		{
			diffObject[ keyPath ] = { path: keyPath , message: 'different typeof: ' + leftTypeof + ' - ' + rightTypeof } ;
			continue ;
		}
		
		if ( leftTypeof === 'object' || leftTypeof === 'function' )
		{
			// Cleanup the 'null is an object' mess
			if ( ! left[ key ] )
			{
				if ( right[ key ] ) { diffObject[ keyPath ] = { path: keyPath , message: 'different type: null - Object' } ; }
				continue ;
			}
			
			if ( ! right[ key ] )
			{
				diffObject[ keyPath ] = { path: keyPath , message: 'different type: Object - null' } ;
				continue ;
			}
			
			if ( Array.isArray( left[ key ] ) && ! Array.isArray( right[ key ] ) )
			{
				diffObject[ keyPath ] = { path: keyPath , message: 'different type: Array - Object' } ;
				continue ;
			}
			
			if ( ! Array.isArray( left[ key ] ) && Array.isArray( right[ key ] ) )
			{
				diffObject[ keyPath ] = { path: keyPath , message: 'different type: Object - Array' } ;
				continue ;
			}
			
			diff( left[ key ] , right[ key ] , { path: keyPath , pathSeparator: options.pathSeparator , depth: depth + 1 , diffObject: diffObject } ) ;
			continue ;
		}
		
		if ( left[ key ] !== right[ key ] )
		{
			diffObject[ keyPath ] = { path: keyPath , message: 'different value: ' + left[ key ] + ' - ' + right[ key ] } ;
			continue ;
		}
	}
	
	
	// Right part
	if ( Array.isArray( right ) )
	{
		arrayMode = true ;
		length = right.length ;
	}
	else
	{
		arrayMode = false ;
		rightKeys = Object.keys( right ) ;
		length = rightKeys.length ;
	}
	
	for ( i = 0 ; i < length ; i ++ )
	{
		key = arrayMode ? i : rightKeys[ i ] ;
		keyPath = options.path + options.pathSeparator + key ;
		//console.log( 'R keyPath:' , keyPath ) ;
		
		if ( ! left.hasOwnProperty( key ) )
		{
			diffObject[ keyPath ] = { path: keyPath , message: 'does not exist in left-hand side' } ;
			continue ;
		}
	}
	
	return Object.keys( diffObject ).length ? diffObject : null ;
}

exports.diff = diff ;


},{}],3:[function(require,module,exports){
/*
	Tree Kit
	
	Copyright (c) 2014 - 2016 Cédric Ronvel
	
	The MIT License (MIT)
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



/*
	== Extend function ==
*/

/*
	options:
		* own: only copy own properties that are enumerable
		* nonEnum: copy non-enumerable properties as well, works only with own:true
		* descriptor: preserve property's descriptor
		* deep: perform a deep (recursive) extend
		* maxDepth: used in conjunction with deep, when max depth is reached an exception is raised, default to 100 when
			the 'circular' option is off, or default to null if 'circular' is on
		* circular: circular references reconnection
		* move: move properties to target (delete properties from the sources)
		* preserve: existing properties in the target object are not overwritten
		* nofunc: skip functions
		* deepFunc: in conjunction with 'deep', this will process sources functions like objects rather than
			copying/referencing them directly into the source, thus, the result will not be a function, it forces 'deep'
		* proto: try to clone objects with the right prototype, using Object.create() or mutating it with Object.setPrototypeOf(),
			it forces option 'own'.
		* inherit: rather than mutating target prototype for source prototype like the 'proto' option does, here it is
			the source itself that IS the prototype for the target. Force option 'own' and disable 'proto'.
		* skipRoot: the prototype of the target root object is NOT mutated only if this option is set.
		* flat: extend into the target top-level only, compose name with the path of the source, force 'deep',
			disable 'unflat', 'proto', 'inherit'
		* unflat: assume sources are in the 'flat' format, expand all properties deeply into the target, disable 'flat'
		* deepFilter
			* blacklist: list of black-listed prototype: the recursiveness of the 'deep' option will be disabled
				for object whose prototype is listed
			* whitelist: the opposite of blacklist
*/
function extend( options , target )
{
	//console.log( "\nextend():\n" , arguments ) ;
	var i , source , newTarget = false , length = arguments.length ;
	
	if ( length < 3 ) { return target ; }
	
	var sources = Array.prototype.slice.call( arguments , 2 ) ;
	length = sources.length ;
	
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	var runtime = { depth: 0 , prefix: '' } ;
	
	if ( ! options.maxDepth && options.deep && ! options.circular ) { options.maxDepth = 100 ; }
	
	if ( options.deepFunc ) { options.deep = true ; }
	
	if ( options.deepFilter && typeof options.deepFilter === 'object' )
	{
		if ( options.deepFilter.whitelist && ( ! Array.isArray( options.deepFilter.whitelist ) || ! options.deepFilter.whitelist.length ) ) { delete options.deepFilter.whitelist ; }
		if ( options.deepFilter.blacklist && ( ! Array.isArray( options.deepFilter.blacklist ) || ! options.deepFilter.blacklist.length ) ) { delete options.deepFilter.blacklist ; }
		if ( ! options.deepFilter.whitelist && ! options.deepFilter.blacklist ) { delete options.deepFilter ; }
	}
	
	// 'flat' option force 'deep'
	if ( options.flat )
	{
		options.deep = true ;
		options.proto = false ;
		options.inherit = false ;
		options.unflat = false ;
		if ( typeof options.flat !== 'string' ) { options.flat = '.' ; }
	}
	
	if ( options.unflat )
	{
		options.deep = false ;
		options.proto = false ;
		options.inherit = false ;
		options.flat = false ;
		if ( typeof options.unflat !== 'string' ) { options.unflat = '.' ; }
	}
	
	// If the prototype is applied, only owned properties should be copied
	if ( options.inherit ) { options.own = true ; options.proto = false ; }
	else if ( options.proto ) { options.own = true ; }
	
	if ( ! target || ( typeof target !== 'object' && typeof target !== 'function' ) )
	{
		newTarget = true ;
	}
	
	if ( ! options.skipRoot && ( options.inherit || options.proto ) )
	{
		for ( i = length - 1 ; i >= 0 ; i -- )
		{
			source = sources[ i ] ;
			if ( source && ( typeof source === 'object' || typeof source === 'function' ) )
			{
				if ( options.inherit )
				{
					if ( newTarget ) { target = Object.create( source ) ; }
					else { Object.setPrototypeOf( target , source ) ; }
				}
				else if ( options.proto )
				{
					if ( newTarget ) { target = Object.create( Object.getPrototypeOf( source ) ) ; }
					else { Object.setPrototypeOf( target , Object.getPrototypeOf( source ) ) ; }
				}
				
				break ;
			}
		}
	}
	else if ( newTarget )
	{
		target = {} ;
	}
	
	runtime.references = { sources: [] , targets: [] } ;
	
	for ( i = 0 ; i < length ; i ++ )
	{
		source = sources[ i ] ;
		if ( ! source || ( typeof source !== 'object' && typeof source !== 'function' ) ) { continue ; }
		extendOne( runtime , options , target , source ) ;
	}
	
	return target ;
}

module.exports = extend ;



function extendOne( runtime , options , target , source )
{
	//console.log( "\nextendOne():\n" , arguments ) ;
	//process.exit() ;
	
	var j , jmax , sourceKeys , sourceKey , sourceValue , sourceValueProto ,
		value , sourceDescriptor , targetKey , targetPointer , path ,
		indexOfSource = -1 ;
	
	// Max depth check
	if ( options.maxDepth && runtime.depth > options.maxDepth )
	{
		throw new Error( '[tree] extend(): max depth reached(' + options.maxDepth + ')' ) ;
	}
	
		
	if ( options.circular )
	{
		runtime.references.sources.push( source ) ;
		runtime.references.targets.push( target ) ;
	}
	
	if ( options.own )
	{
		if ( options.nonEnum ) { sourceKeys = Object.getOwnPropertyNames( source ) ; }
		else { sourceKeys = Object.keys( source ) ; }
	}
	else { sourceKeys = source ; }
	
	for ( sourceKey in sourceKeys )
	{
		if ( options.own ) { sourceKey = sourceKeys[ sourceKey ] ; }
		
		// If descriptor is on, get it now
		if ( options.descriptor )
		{
			sourceDescriptor = Object.getOwnPropertyDescriptor( source , sourceKey ) ;
			sourceValue = sourceDescriptor.value ;
		}
		else
		{
			// We have to trigger an eventual getter only once
			sourceValue = source[ sourceKey ] ;
		}
		
		targetPointer = target ;
		targetKey = runtime.prefix + sourceKey ;
		
		// Do not copy if property is a function and we don't want them
		if ( options.nofunc && typeof sourceValue === 'function' ) { continue; }
		
		// 'unflat' mode computing
		if ( options.unflat && runtime.depth === 0 )
		{
			path = sourceKey.split( options.unflat ) ;
			jmax = path.length - 1 ;
			
			if ( jmax )
			{
				for ( j = 0 ; j < jmax ; j ++ )
				{
					if ( ! targetPointer[ path[ j ] ] ||
						( typeof targetPointer[ path[ j ] ] !== 'object' &&
							typeof targetPointer[ path[ j ] ] !== 'function' ) )
					{
						targetPointer[ path[ j ] ] = {} ;
					}
					
					targetPointer = targetPointer[ path[ j ] ] ;
				}
				
				targetKey = runtime.prefix + path[ jmax ] ;
			}
		}
		
		
		if ( options.deep &&
			sourceValue &&
			( typeof sourceValue === 'object' || ( options.deepFunc && typeof sourceValue === 'function' ) ) &&
			( ! options.descriptor || ! sourceDescriptor.get ) &&
			// not a condition we just cache sourceValueProto now
			( ( sourceValueProto = Object.getPrototypeOf( sourceValue ) ) || true ) &&
			( ! options.deepFilter ||
				( ( ! options.deepFilter.whitelist || options.deepFilter.whitelist.indexOf( sourceValueProto ) !== -1 ) &&
					( ! options.deepFilter.blacklist || options.deepFilter.blacklist.indexOf( sourceValueProto ) === -1 ) ) ) )
		{
			if ( options.circular )
			{
				indexOfSource = runtime.references.sources.indexOf( sourceValue ) ;
			}
			
			if ( options.flat )
			{
				// No circular references reconnection when in 'flat' mode
				if ( indexOfSource >= 0 ) { continue ; }
				
				extendOne(
					{ depth: runtime.depth + 1 , prefix: runtime.prefix + sourceKey + options.flat , references: runtime.references } ,
					options , targetPointer , sourceValue
				) ;
			}
			else
			{
				if ( indexOfSource >= 0 )
				{
					// Circular references reconnection...
					if ( options.descriptor )
					{
						Object.defineProperty( targetPointer , targetKey , {
							value: runtime.references.targets[ indexOfSource ] ,
							enumerable: sourceDescriptor.enumerable ,
							writable: sourceDescriptor.writable ,
							configurable: sourceDescriptor.configurable
						} ) ;
					}
					else
					{
						targetPointer[ targetKey ] = runtime.references.targets[ indexOfSource ] ;
					}
					
					continue ;
				}
				
				if ( ! targetPointer[ targetKey ] || ! targetPointer.hasOwnProperty( targetKey ) || ( typeof targetPointer[ targetKey ] !== 'object' && typeof targetPointer[ targetKey ] !== 'function' ) )
				{
					if ( Array.isArray( sourceValue ) ) { value = [] ; }
					else if ( options.proto ) { value = Object.create( sourceValueProto ) ; }	// jshint ignore:line
					else if ( options.inherit ) { value = Object.create( sourceValue ) ; }
					else { value = {} ; }
					
					if ( options.descriptor )
					{
						Object.defineProperty( targetPointer , targetKey , {
							value: value ,
							enumerable: sourceDescriptor.enumerable ,
							writable: sourceDescriptor.writable ,
							configurable: sourceDescriptor.configurable
						} ) ;
					}
					else
					{
						targetPointer[ targetKey ] = value ;
					}
				}
				else if ( options.proto && Object.getPrototypeOf( targetPointer[ targetKey ] ) !== sourceValueProto )
				{
					Object.setPrototypeOf( targetPointer[ targetKey ] , sourceValueProto ) ;
				}
				else if ( options.inherit && Object.getPrototypeOf( targetPointer[ targetKey ] ) !== sourceValue )
				{
					Object.setPrototypeOf( targetPointer[ targetKey ] , sourceValue ) ;
				}
				
				if ( options.circular )
				{
					runtime.references.sources.push( sourceValue ) ;
					runtime.references.targets.push( targetPointer[ targetKey ] ) ;
				}
				
				// Recursively extends sub-object
				extendOne(
					{ depth: runtime.depth + 1 , prefix: '' , references: runtime.references } ,
					options , targetPointer[ targetKey ] , sourceValue
				) ;
			}
		}
		else if ( options.preserve && targetPointer[ targetKey ] !== undefined )
		{
			// Do not overwrite, and so do not delete source's properties that were not moved
			continue ;
		}
		else if ( ! options.inherit )
		{
			if ( options.descriptor ) { Object.defineProperty( targetPointer , targetKey , sourceDescriptor ) ; }
			else { targetPointer[ targetKey ] = sourceValue ; }
		}
		
		// Delete owned property of the source object
		if ( options.move ) { delete source[ sourceKey ] ; }
	}
}


},{}],4:[function(require,module,exports){
/*
	Tree Kit
	
	Copyright (c) 2014 - 2016 Cédric Ronvel
	
	The MIT License (MIT)
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



/*
	== Lazy function ==
*/

exports.defineLazyProperty = function defineLazyProperty( object , name , func )
{
	Object.defineProperty( object , name , {
		configurable: true ,
		enumerable: true ,
		get: function() {
			
			var value = func() ;
			
			Object.defineProperty( object , name , {
				configurable: true ,
				enumerable: true ,
				writable: false ,
				value: value
			} ) ;
			
			return value ;
		}
	} ) ;
} ;

},{}],5:[function(require,module,exports){
/*
	Tree Kit
	
	Copyright (c) 2014 - 2016 Cédric Ronvel
	
	The MIT License (MIT)
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



// Load modules
var tree = require( './tree.js' ) ;
var util = require( 'util' ) ;



// Create and export
var masklib = {} ;
module.exports = masklib ;



/*
	== Mask-family class ==
	
	Recursively select values in the input object if the same path in the mask object is set.
*/

/*
	TODO:
	- negative mask
	- constraint check
	- Maskable object, like in csk-php
*/

masklib.Mask = function Mask()
{
	throw new Error( 'Cannot create a tree.Mask() directly' ) ;
} ;



var maskDefaultOptions = {
	clone: false ,
	path: '<object>' ,
	pathSeparator: '.'
} ;



/*
	options:
		clone: the output clone the input rather than reference it
		pathSeperator: when expressing path, this is the separator
		leaf: a callback to exec for each mask leaf
		node? a callback to exec for each mask node
*/
masklib.createMask = function createMask( maskArgument , options )
{
	if ( maskArgument === null || typeof maskArgument !== 'object' )
	{
		throw new TypeError( '[tree] .createMask() : Argument #1 should be an object' ) ;
	}
	
	if ( options !== null && typeof options === 'object' ) { options = tree.extend( null , {} , maskDefaultOptions , options ) ; }
	else { options = maskDefaultOptions ; }
	
	var mask = Object.create( masklib.Mask.prototype , {
		__options__: { value: options , writable: true  }
	} ) ;
	
	tree.extend( null , mask , maskArgument ) ;
	
	return mask ;
} ;



// Apply the mask to an input tree
masklib.Mask.prototype.applyTo = function applyTo( input , context , contextOverideDefault )
{
	// Arguments checking
	if ( input === null || typeof input !== 'object' )
	{
		throw new TypeError( '[tree] .applyTo() : Argument #1 should be an object' ) ;
	}
	
	if ( contextOverideDefault )
	{
		context = tree.extend( null ,
			{
				mask: this ,
				options: this.__options__ ,
				path: this.__options__.path
			} ,
			context
		) ;
	}
	else if ( context === undefined )
	{
		context = {
			mask: this ,
			options: this.__options__ ,
			path: this.__options__.path
		} ;
	}
	
	
	// Init
	//console.log( context ) ;
	var result , nextPath , output ,
		i , key , maskValue ,
		maskKeyList = Object.keys( context.mask ) ,
		j , inputKey , inputValue , inputKeyList ;
	
	if ( Array.isArray( input ) ) { output = [] ; }
	else { output = {} ; }
	
	
	// Iterate through mask properties
	for ( i = 0 ; i < maskKeyList.length ; i ++ )
	{
		key = maskKeyList[ i ] ;
		maskValue = context.mask[ key ] ;
		
		//console.log( '\nnext loop: ' , key , maskValue ) ;
		
		// The special key * is a wildcard, it match everything
		if ( key === '*' )
		{
			//console.log( 'wildcard' ) ;
			inputKeyList = Object.keys( input ) ;
			
			for ( j = 0 ; j < inputKeyList.length ; j ++ )
			{
				inputKey = inputKeyList[ j ] ;
				inputValue = input[ inputKey ] ;
				
				//console.log( '*: ' , inputKey ) ;
				nextPath = context.path + context.options.pathSeparator + inputKey ;
				
				// If it is an array or object, recursively check it
				if ( maskValue !== null && typeof maskValue === 'object' )
				{
					if ( input[ inputKey ] !== null && typeof input[ inputKey ] === 'object' )
					{
						if ( input[ inputKey ] instanceof masklib.Mask )
						{
							output[ inputKey ] = input[ inputKey ].applyTo( input[ inputKey ] , { path: nextPath } , true ) ;
						}
						else
						{
							output[ inputKey ] = this.applyTo( input[ inputKey ] , tree.extend( null , {} , context , { mask: maskValue , path: nextPath } ) ) ;
						}
					}
					else if ( typeof context.options.leaf === 'function' )
					{
						output[ inputKey ] = this.applyTo( {} , tree.extend( null , {} , context , { mask: maskValue , path: nextPath } ) ) ;
					}
				}
				else if ( maskValue !== null && typeof context.options.leaf === 'function' )
				{
					//console.log( 'leaf callback' ) ;
					result = context.options.leaf( input , inputKey , maskValue , nextPath ) ;
					if ( ! ( result instanceof Error ) ) { output[ inputKey ] = result ; }
				}
				else
				{
					if ( context.options.clone && ( input[ inputKey ] !== null && typeof input[ inputKey ] === 'object' ) )
					{
						output[ inputKey ] = tree.extend( { deep: true } , {} , input[ inputKey ] ) ;
					}
					else
					{
						output[ inputKey ] = input[ inputKey ] ;
					}
				}
			}
			
			continue ;
		}
		
		
		nextPath = context.path + context.options.pathSeparator + key ;
		
		// If it is an object, recursively check it
		//if ( maskValue instanceof masklib.Mask )
		if ( maskValue !== null && typeof maskValue === 'object' )
		{
			//console.log( 'sub' ) ;
			
			if ( input.hasOwnProperty( key ) && input[ key ] !== null && typeof input[ key ] === 'object' )
			{
				//console.log( 'recursive call' ) ;
				
				if ( input.key instanceof masklib.Mask )
				{
					output[ key ] = input.key.applyTo( input[ key ] , { path: nextPath } , true ) ;
				}
				else
				{
					output[ key ] = this.applyTo( input[ key ] , tree.extend( null , {} , context , { mask: maskValue , path: nextPath } ) ) ;
				}
			}
			// recursive call only if there are callback
			else if ( context.options.leaf )
			{
				//console.log( 'recursive call' ) ;
				output[ key ] = this.applyTo( {} , tree.extend( null , {} , context , { mask: maskValue , path: nextPath } ) ) ;
			}
		}
		// If mask exists, add the key
		else if ( input.hasOwnProperty( key ) )
		{
			//console.log( 'property found' ) ;
			
			if ( maskValue !== undefined && typeof context.options.leaf === 'function' )
			{
				//console.log( 'leaf callback' ) ;
				result = context.options.leaf( input , key , maskValue , nextPath ) ;
				if ( ! ( result instanceof Error ) ) { output[ key ] = result ; }
			}
			else
			{
				if ( context.options.clone && ( input[ key ] !== null && typeof input[ key ] === 'object' ) )
				{
					output[ key ] = tree.extend( { deep: true } , {} , input[ key ] ) ;
				}
				else
				{
					output[ key ] = input[ key ] ;
				}
			}
		}
		else if ( maskValue !== undefined && typeof context.options.leaf === 'function' )
		{
			//console.log( 'leaf callback' ) ;
			result = context.options.leaf( input , key , maskValue , nextPath ) ;
			if ( ! ( result instanceof Error ) ) { output[ key ] = result ; }
		}
	}
	
	return output ;
} ;



// InverseMask: create an output tree from the input, by excluding properties of the mask

masklib.InverseMask = function InverseMask()
{
	throw new Error( 'Cannot create a tree.InverseMask() directly' ) ;
} ;

util.inherits( masklib.InverseMask , masklib.Mask ) ;



/*
	options:
		clone: the output clone the input rather than reference it
		pathSeperator: when expressing path, this is the separator
*/
masklib.createInverseMask = function createInverseMask( maskArgument , options )
{
	if ( maskArgument === null || typeof maskArgument !== 'object' )
	{
		throw new TypeError( '[tree] .createInverseMask() : Argument #1 should be an object' ) ;
	}
	
	if ( options !== null && typeof options === 'object' ) { options = tree.extend( null , {} , maskDefaultOptions , options ) ; }
	else { options = maskDefaultOptions ; }
	
	var mask = Object.create( masklib.InverseMask.prototype , {
		__options__: { value: options , writable: true  }
	} ) ;
	
	tree.extend( null , mask , maskArgument ) ;
	
	return mask ;
} ;



// Apply the mask to an input tree
masklib.InverseMask.prototype.applyTo = function applyTo( input , context , contextOverideDefault )
{
	// Arguments checking
	if ( input === null || typeof input !== 'object' )
	{
		throw new TypeError( '[tree] .applyTo() : Argument #1 should be an object' ) ;
	}
	
	if ( contextOverideDefault )
	{
		context = tree.extend( null ,
			{
				mask: this ,
				options: this.__options__ ,
				path: this.__options__.path
			} ,
			context
		) ;
	}
	else if ( context === undefined )
	{
		context = {
			mask: this ,
			options: this.__options__ ,
			path: this.__options__.path
		} ;
	}
	
	
	// Init
	//console.log( context ) ;
	var nextPath , output ,
		i , key , maskValue ,
		maskKeyList = Object.keys( context.mask ) ,
		j , inputKey , inputValue , inputKeyList ;
	
	if ( Array.isArray( input ) ) { output = tree.extend( { deep: true } , [] , input ) ; }
	else { output = tree.extend( { deep: true } , {} , input ) ; }
	
	//console.log( output ) ;
	
	// Iterate through mask properties
	for ( i = 0 ; i < maskKeyList.length ; i ++ )
	{
		key = maskKeyList[ i ] ;
		maskValue = context.mask[ key ] ;
		
		//console.log( '\nnext loop: ' , key , maskValue ) ;
		
		// The special key * is a wildcard, it match everything
		if ( key === '*' )
		{
			//console.log( 'wildcard' ) ;
			inputKeyList = Object.keys( input ) ;
			
			for ( j = 0 ; j < inputKeyList.length ; j ++ )
			{
				inputKey = inputKeyList[ j ] ;
				inputValue = input[ inputKey ] ;
				
				//console.log( '*: ' , inputKey ) ;
				nextPath = context.path + context.options.pathSeparator + inputKey ;
				
				// If it is an array or object, recursively check it
				if ( maskValue !== null && typeof maskValue === 'object' )
				{
					if ( input[ inputKey ] !== null && typeof input[ inputKey ] === 'object' )
					{
						if ( input[ inputKey ] instanceof masklib.Mask )
						{
							output[ inputKey ] = input[ inputKey ].applyTo( input[ inputKey ] , { path: nextPath } , true ) ;
						}
						else
						{
							output[ inputKey ] = this.applyTo( input[ inputKey ] , tree.extend( null , {} , context , { mask: maskValue , path: nextPath } ) ) ;
						}
					}
				}
				else
				{
					delete output[ inputKey ] ;
				}
			}
			
			continue ;
		}
		
		
		nextPath = context.path + context.options.pathSeparator + key ;
		
		// If it is an object, recursively check it
		//if ( maskValue instanceof masklib.Mask )
		if ( maskValue !== null && typeof maskValue === 'object' )
		{
			//console.log( 'sub' ) ;
			
			if ( input.hasOwnProperty( key ) && input[ key ] !== null && typeof input[ key ] === 'object' )
			{
				//console.log( 'recursive call' ) ;
				
				if ( input.key instanceof masklib.Mask )
				{
					output[ key ] = input.key.applyTo( input[ key ] , { path: nextPath } , true ) ;
				}
				else
				{
					output[ key ] = this.applyTo( input[ key ] , tree.extend( null , {} , context , { mask: maskValue , path: nextPath } ) ) ;
				}
			}
		}
		// If mask exists, remove the key
		else if ( input.hasOwnProperty( key ) )
		{
			delete output[ key ] ;
		}
	}
	
	return output ;
} ;

},{"./tree.js":7,"util":12}],6:[function(require,module,exports){
/*
	Tree Kit
	
	Copyright (c) 2014 - 2016 Cédric Ronvel
	
	The MIT License (MIT)
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



var treePath = {} ;
module.exports = treePath ;



treePath.op = function op( type , object , path , value )
{
	var i , parts , last , pointer , key , isArray = false , pathArrayMode = false , isGenericSet , canBeEmpty = true ;
	
	if ( ! object || ( typeof object !== 'object' && typeof object !== 'function' ) )
	{
		return ;
	}
	
	if ( typeof path === 'string' )
	{
		// Split the path into parts
		if ( path ) { parts = path.match( /([.#\[\]]|[^.#\[\]]+)/g ) ; }
		else { parts = [ '' ] ; }
		
		if ( parts[ 0 ] === '.' ) { parts.unshift( '' ) ; }
		if ( parts[ parts.length - 1 ] === '.' ) { parts.push( '' ) ; }
	}
	else if ( Array.isArray( path ) )
	{
		parts = path ;
		pathArrayMode = true ;
	}
	else
	{
		throw new TypeError( '[tree.path] .' + type + '(): the path argument should be a string or an array' ) ;
	}
	
	switch ( type )
	{
		case 'get' :
		case 'delete' :
			isGenericSet = false ;
			break ;
		case 'set' :
		case 'define' :
		case 'inc' :
		case 'dec' :
		case 'append' :
		case 'prepend' :
		case 'concat' :
		case 'insert' :
		case 'autoPush' :
			isGenericSet = true ;
			break ;
		default :
			throw new TypeError( "[tree.path] .op(): wrong type of operation '" + type + "'" ) ;
	}
	
	//console.log( parts ) ;
	// The pointer start at the object's root
	pointer = object ;
	
	last = parts.length - 1 ;
	
	for ( i = 0 ; i <= last ; i ++ )
	{
		if ( pathArrayMode )
		{
			if ( key === undefined )
			{
				key = parts[ i ] ;
				continue ;
			}
			
			if ( ! pointer[ key ] || ( typeof pointer[ key ] !== 'object' && typeof pointer[ key ] !== 'function' ) )
			{
				if ( ! isGenericSet ) { return undefined ; }
				pointer[ key ] = {} ;
			}
			
			pointer = pointer[ key ] ;
			key = parts[ i ] ;
			
			continue ;
		}
		else if ( parts[ i ] === '.' )
		{
			isArray = false ;
			
			if ( key === undefined )
			{
				if ( ! canBeEmpty )
				{
					canBeEmpty = true ;
					continue ;
				}
				
				key = '' ;
			}
			
			if ( ! pointer[ key ] || ( typeof pointer[ key ] !== 'object' && typeof pointer[ key ] !== 'function' ) )
			{
				if ( ! isGenericSet ) { return undefined ; }
				pointer[ key ] = {} ;
			}
			
			pointer = pointer[ key ] ;
			canBeEmpty = true ;
			
			continue ;
		}
		else if ( parts[ i ] === '#' || parts[ i ] === '[' )
		{
			isArray = true ;
			canBeEmpty = false ;
			
			if ( key === undefined )
			{
				// The root element cannot be altered, we are in trouble if an array is expected but we have only a regular object.
				if ( ! Array.isArray( pointer ) ) { return undefined ; }
				continue ;
			}
			
			if ( ! pointer[ key ] || ! Array.isArray( pointer[ key ] ) )
			{
				if ( ! isGenericSet ) { return undefined ; }
				pointer[ key ] = [] ;
			}
			
			pointer = pointer[ key ] ;
			
			continue ;
		}
		else if ( parts[ i ] === ']' )
		{
			// Closing bracket: do nothing
			canBeEmpty = false ;
			continue ;
		}
		
		canBeEmpty = false ;
		
		if ( ! isArray ) { key = parts[ i ] ; continue ; }
		
		switch ( parts[ i ] )
		{
			case 'length' :
				key = parts[ i ] ;
				break ;
			
			// Pseudo-key
			case 'first' :
				key = 0 ;
				break ;
			case 'last' :
				key = pointer.length - 1 ;
				if ( key < 0 ) { key = 0 ; }
				break ;
			case 'next' :
				if ( ! isGenericSet ) { return undefined ; }
				key = pointer.length ;
				break ;
			case 'insert' :
				if ( ! isGenericSet ) { return undefined ; }
				pointer.unshift( undefined ) ;
				key = 0 ;
				break ;
			
			// default = number
			default:
				// Convert the string key to a numerical index
				key = parseInt( parts[ i ] , 10 ) ;
		}
	}
	
	switch ( type )
	{
		case 'get' :
			return pointer[ key ] ;
		case 'delete' :
			if ( isArray && typeof key === 'number' ) { pointer.splice( key , 1 ) ; }
			else { delete pointer[ key ] ; }
			return ;
		case 'set' :
			pointer[ key ] = value ;
			return pointer[ key ] ;
		case 'define' :
			// define: set only if it doesn't exist
			if ( ! ( key in pointer ) ) { pointer[ key ] = value ; }
			return pointer[ key ] ;
		case 'inc' :
			if ( typeof pointer[ key ] === 'number' ) { pointer[ key ] ++ ; }
			else if ( ! pointer[ key ] || typeof pointer[ key ] !== 'object' ) { pointer[ key ] = 1 ; }
			return pointer[ key ] ;
		case 'dec' :
			if ( typeof pointer[ key ] === 'number' ) { pointer[ key ] -- ; }
			else if ( ! pointer[ key ] || typeof pointer[ key ] !== 'object' ) { pointer[ key ] = -1 ; }
			return pointer[ key ] ;
		case 'append' :
			if ( ! pointer[ key ] ) { pointer[ key ] = [ value ] ; }
			else if ( Array.isArray( pointer[ key ] ) ) { pointer[ key ].push( value ) ; }
			//else ? do nothing???
			return pointer[ key ] ;
		case 'prepend' :
			if ( ! pointer[ key ] ) { pointer[ key ] = [ value ] ; }
			else if ( Array.isArray( pointer[ key ] ) ) { pointer[ key ].unshift( value ) ; }
			//else ? do nothing???
			return pointer[ key ] ;
		case 'concat' :
			if ( ! pointer[ key ] ) { pointer[ key ] = value ; }
			else if ( Array.isArray( pointer[ key ] ) && Array.isArray( value ) )
			{
				pointer[ key ] = pointer[ key ].concat( value ) ;
			}
			//else ? do nothing???
			return pointer[ key ] ;
		case 'insert' :
			if ( ! pointer[ key ] ) { pointer[ key ] = value ; }
			else if ( Array.isArray( pointer[ key ] ) && Array.isArray( value ) )
			{
				pointer[ key ] = value.concat( pointer[ key ] ) ;
			}
			//else ? do nothing???
			return pointer[ key ] ;
		case 'autoPush' :
			if ( pointer[ key ] === undefined ) { pointer[ key ] = value ; }
			else if ( Array.isArray( pointer[ key ] ) ) { pointer[ key ].push( value ) ; }
			else { pointer[ key ] = [ pointer[ key ] , value ] ; }
			return pointer[ key ] ;
	}
} ;



// get, set and delete use the same op() function
treePath.get = treePath.op.bind( undefined , 'get' ) ;
treePath.delete = treePath.op.bind( undefined , 'delete' ) ;
treePath.set = treePath.op.bind( undefined , 'set' ) ;
treePath.define = treePath.op.bind( undefined , 'define' ) ;
treePath.inc = treePath.op.bind( undefined , 'inc' ) ;
treePath.dec = treePath.op.bind( undefined , 'dec' ) ;
treePath.append = treePath.op.bind( undefined , 'append' ) ;
treePath.prepend = treePath.op.bind( undefined , 'prepend' ) ;
treePath.concat = treePath.op.bind( undefined , 'concat' ) ;
treePath.insert = treePath.op.bind( undefined , 'insert' ) ;
treePath.autoPush = treePath.op.bind( undefined , 'autoPush' ) ;



// Prototype used for object creation, so they can be created with Object.create( tree.path.prototype )
treePath.prototype = {
	get: function( path ) { return treePath.get( this , path ) ; } ,
	delete: function( path ) { return treePath.delete( this , path ) ; } ,
	set: function( path , value ) { return treePath.set( this , path , value ) ; } ,
	define: function( path , value ) { return treePath.define( this , path , value ) ; } ,
	inc: function( path , value ) { return treePath.inc( this , path , value ) ; } ,
	dec: function( path , value ) { return treePath.dec( this , path , value ) ; } ,
	append: function( path , value ) { return treePath.append( this , path , value ) ; } ,
	prepend: function( path , value ) { return treePath.prepend( this , path , value ) ; } ,
	concat: function( path , value ) { return treePath.concat( this , path , value ) ; } ,
	insert: function( path , value ) { return treePath.insert( this , path , value ) ; } ,
	autoPush: function( path , value ) { return treePath.autoPush( this , path , value ) ; }
} ;



// Upgrade an object so it can support get, set and delete at its root
treePath.upgrade = function upgrade( object )
{
	Object.defineProperties( object , {
		get: { value: treePath.op.bind( undefined , 'get' , object ) } ,
		delete: { value: treePath.op.bind( undefined , 'delete' , object ) } ,
		set: { value: treePath.op.bind( undefined , 'set' , object ) } ,
		define: { value: treePath.op.bind( undefined , 'define' , object ) } ,
		inc: { value: treePath.op.bind( undefined , 'inc' , object ) } ,
		dec: { value: treePath.op.bind( undefined , 'dec' , object ) } ,
		append: { value: treePath.op.bind( undefined , 'append' , object ) } ,
		prepend: { value: treePath.op.bind( undefined , 'prepend' , object ) } ,
		concat: { value: treePath.op.bind( undefined , 'concat' , object ) } ,
		insert: { value: treePath.op.bind( undefined , 'insert' , object ) } ,
		autoPush: { value: treePath.op.bind( undefined , 'autoPush' , object ) }
	} ) ;
} ;




},{}],7:[function(require,module,exports){
/*
	Tree Kit
	
	Copyright (c) 2014 - 2016 Cédric Ronvel
	
	The MIT License (MIT)
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



// Create and export
var tree = {} ;
module.exports = tree ;


// Tier 0: extend() is even used to build the module
tree.extend = require( './extend.js' ) ;



tree.extend( null , tree ,
	
	// Tier 1
	require( './lazy.js' ) ,
	
	// Tier 2
	{ clone: require( './clone.js' ) } ,
	
	// Tier 3
	{ path: require( './path.js' ) } ,
	require( './diff.js' ) ,
	require( './mask.js' )
) ;



},{"./clone.js":1,"./diff.js":2,"./extend.js":3,"./lazy.js":4,"./mask.js":5,"./path.js":6}],8:[function(require,module,exports){
var global_spec ;
global_spec = [];
var global_data ;
global_data = [];
function createAndBindAxis(Axis_details, data, axisName){
	var Scale, Axis;
	if(axisName==="x"){
		switch (Axis_details.type){
		case "quantitative":
			Scale = d3.scale.linear().range([0, width/2]);
			break;
		case "nominal":
			Scale = d3.scale.ordinal().range([0, width/2]);
			break;
		case "temporal":
			Scale = d3.time.scale.utc().range([0, width/2]);
			timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S%Z');
			break;
		case "ordinal":
			Scale = d3.scale.ordinal().range([0, width/2]);
			break;
		}
	}
	else{
		switch (Axis_details.type){
		case "quantitative":
			Scale = d3.scale.linear().range([height,0]);
			break;
		case "nominal":
			Scale = d3.scale.ordinal().range([height,0]);
			break;
		case "temporal":
			Scale = d3.time.scale.utc().range([height,0]);
			timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S%Z');
			break;
		case "ordinal":
			Scale = d3.scale.ordinal().range([height,0]);
			break;
		}
	}

	Axis = d3.svg.axis().scale(Scale);
	Scale.domain([0,d3.max(data,function(d){return +d[Axis_details.field]})]);
	return {"scale":Scale, "axis":Axis};
}


function processScatterPlot(spec,data,id, title){

	global_spec.push(spec);
	global_data.push(data);
	var axis_details = spec["encoding"];

	var xAxisDetails = createAndBindAxis(axis_details["x"], data, "x");
	var x = xAxisDetails["scale"];
	var xAxis = xAxisDetails["axis"];
	xAxis.orient("bottom");
	var yAxisDetails = createAndBindAxis(axis_details["y"], data, "y");
	var y = yAxisDetails["scale"];
	var yAxis = yAxisDetails["axis"];
	yAxis.orient("left");



	if(axis_details.color && typeof axis_details.color !="string"){
		var colorField = axis_details.color["field"], colorType = axis_details.color["type"];
	switch(colorType){
		case "nominal":
			var colorScale = d3.scale.category20();
			break;
		case "quantitative":
		case "ordinal":
			var numColors = 8;
			var dataset = data.map(function(d){
				return d[colorField]
			});
			var colorScale = d3.scale.quantize()
  								.domain(d3.extent(dataset))
  								.range(colorbrewer.Reds[numColors]);
  			break;
  		default:
  			var numColors = 8;
			var dataset = data.map(function(d){
				return d[colorField]
			});
			var colorScale = d3.scale.quantize()
  								.domain(d3.extent(dataset))
  								.range(colorbrewer.Reds[numColors]);
	}
	}
	var chart1;

	if(typeof id!=="string"){
		
;
var chart = d3.select('.div4')
	.append('svg:svg').attr("id", id)
	.attr('width', width + margin.right + margin.left)
	.attr('height', height + margin.top + margin.bottom)
	.attr('class', 'chart');
// 	.append("text")
// .attr("x", (width / 2)-margin.left)             
// .attr("y", 0 - (margin.top / 3))
// .attr("text-anchor", "middle")  
// .style("font-size", "16px") 
// .style("color","blue")
// .style("fill","blue")
// .style("text-decoration", "underline")  
// .classed("label",true)
// .text("Value vs Date Graph");

 chart.append("g")
 .classed("x axis", true)
 .attr("transform", "translate("+margin.left+"," + height + ")")
.call(xAxis)
.append("text")
.classed("label",true)
.attr("x", width/4)
.attr("y", margin.bottom)
.style("text-anchor","middle")
.text(axis_details["x"].field);


 chart.append('g')
	.classed("y axis",true)
	.attr("transform", "translate(" + margin.left + ",0)")
	.call(yAxis)
	.append("text")
      .classed("label",true)
      .attr("transform", "translate(" + -margin.left/24 + ","+height/2+")rotate(-90)")
      .attr("y", -margin.left/3)
      .style("text-anchor", "middle");
// chart1 = chart;
var scatter = chart.selectAll("scatter-dots")
      .data(data)
      .enter().append("circle")
          .attr("cx", function (d,i) {
          	return x(d[axis_details["x"].field]); } )
          .attr("cy", function (d) {
          	return y(d[axis_details["y"].field]); } )
          .attr("r", 4);

    var textnode = document.createTextNode(title);

	d3.select('.div4')[0][0].appendChild(textnode);
	d3.select('.div4')[0][0].style.fontSize = "10px";


	}

	else{

		

		if (d3.select('#source')[0][0]!= null){
			var chart = d3.select('#source');
			chart.append("g")
			 .classed("x axis", true)
			 .attr("transform", "translate("+(width/2+margin.left+margin.left)+"," + height + ")")
			.call(xAxis)
			.append("text")
			.classed("label",true)
			.attr("x", width/4)
			.attr("y", margin.bottom)
			.style("text-anchor","middle")
			.text(axis_details["x"].field);

    chart.append('g')
	.classed("y axis",true)
	.attr("transform", "translate(" + (width/2+margin.left+margin.left) + ",0)")
	.call(yAxis)
	.append("text")
      .classed("label",true)
      .attr("transform", "translate(" + -margin.left/24 + ","+height/2+")rotate(-90)")
      .attr("y", -margin.left/3)
      .style("text-anchor", "middle")
      .text(axis_details["y"].field);

      var target_g = chart.append("g")
            .attr("class","target_area")
            .attr("transform", "translate("+(width/2 + margin.left +margin.left)+","  + "0)")
            .attr("width",width/2)
            .attr("height",height);

          chart1 = target_g;

          var scatter = chart1.selectAll("scatter-dots")
      .data(data)
      .enter().append("circle")
          .attr("cx", function (d,i) {
          	return x(d[axis_details["x"].field]); } )
          .attr("cy", function (d) {
          	return y(d[axis_details["y"].field]); } )
          .attr("r", 4);

          var textnode = document.createTextNode(title);

	d3.select('.div1')[0][0].appendChild(textnode)
;
d3.select('.div1')[0][0].style.fontSize = "10px";

	
}
		else{
			var textnode = document.createTextNode(title);

	d3.select('.div1')[0][0].appendChild(textnode)
;
d3.select('.div1')[0][0].style.fontSize = "10px";

			var chart = d3.select('.div1')
	.append('svg:svg').attr("id", id)
	.attr('width', width + margin.right + margin.left)
	.attr('height', height + margin.top + margin.bottom)
	.attr('class', 'chart');

	chart.append("g")
 .classed("x axis", true)
 .attr("transform", "translate("+margin.left+"," + height + ")")
.call(xAxis)
.append("text")
.classed("label",true)
.attr("x", width/4)
.attr("y", margin.bottom)
.style("text-anchor","middle")
.text(axis_details["x"].field);

    chart.append('g')
	.classed("y axis",true)
	.attr("transform", "translate(" + margin.left + ",0)")
	.call(yAxis)
	.append("text")
      .classed("label",true)
      .attr("transform", "translate(" + -margin.left/24 + ","+height/2+")rotate(-90)")
      .attr("y", -margin.left/3)
      .style("text-anchor", "middle")
      .text(axis_details["y"].field);
      chart1 = chart;

      var scatter = chart1.selectAll("scatter-dots")
      .data(data)
      .enter().append("circle")
          .attr("cx", function (d,i) {
          	return x(d[axis_details["x"].field]); } )
          .attr("cy", function (d) {
          	return y(d[axis_details["y"].field]); } )
          .attr("r", 4)
          .classed("baseCircle", true);

        		   function moveCircle() {
            d3.select(this)
                .attr('cx', d3.event.x)
                .attr('cy', d3.event.y);
        }

        var drag = d3.behavior.drag()
            .on("dragstart", dragstart)
            .on("drag", drag_func)
            .on("dragend", dragend);

         scatter.call(drag);

         var targetCircle = scatter;
        var tempCircle = scatter;

        function dragstart() {
            console.log("circle dragged is::" + d3.select(this).attr("id"));
            if (d3.select(this).classed("baseCircle") === true) {

                targetCircle = chart.append("circle")
                    .attr("r", 4) 
                    .attr("cx", targetCircle.attr("cx"))
                    .attr("cy", targetCircle.attr("cy"))
                    .style("fill", d3.select(this)[0][0].style.fill);
            } else {
                targetCircle = d3.select(this);
                tempCircle = this;
            }
            targetCircle.classed("dragTarget", true);
        }

        function drag_func() {
            targetCircle.attr("cx", d3.event.x)
                .attr("cy", d3.event.y);
        }

        var groupAll = d3.behavior.drag()
            .origin(Object)
            .on("drag", function(d, i) {
                var child = this;
                var move = d3.transform(child.getAttribute("transform")).translate;
                var x = d3.event.dx + move[0];
                var y = d3.event.dy + move[1];
                d3.select(child).attr("transform", "translate(" + x + "," + y + ")");
                
            });

        var that = this;
        that.spec = global_spec[1];
        that.data = global_data[1];

        function dragend(d) {
           
            var tx = targetCircle.attr("cx"),
                ty = targetCircle.attr("cy");

            var nearness;

            if (8*ty < tx)
            {
            	nearness = 'y'
            }
            else if (tx - 3*ty < 200)
            {
            	nearness = 'x'
            }
            else{
            	nearness = 'center'
            }

 			var color_to_fill = targetCircle[0][0].style.fill;
 			render_spec(color_to_fill, nearness);
            targetCircle.remove();
           
        }

        function render_spec(color_to_fill, nearness){
        	global_spec[1].encoding.color = color_to_fill;
        	if(nearness == 'x'){
        	compare_and_render_color([global_spec[0],global_spec[1]],[global_data[0],global_data[1]])
        	processScatterPlot(global_spec[1],global_data[1],2, 'Color by current selection');
        	}
        	else if (nearness == 'y'){
        		
        	compare_and_render_color([global_spec[0],global_spec[1]],[global_data[0],global_data[1]])
        	processScatterPlot(global_spec[1],global_data[1],2, 'Color by current selection');
        	}
        	else{
        		processScatterPlot(global_spec[1],global_data[1],2, 'Color by current selection');
        	compare_and_render_color([global_spec[0],global_spec[1]],[global_data[0],global_data[1]])
        	
        	}
        	

        }


		}






	}

      if(axis_details.color && typeof axis_details.color != "string"){
      	scatter.style("fill",function(d){
      		return colorScale(d[colorField])
      	});
      }
      else if (axis_details.color && typeof axis_details.color == "string"){
      	scatter.style("fill",axis_details.color);
      }

}

d3.select('.div4').on("click", function() {

  length_data = d3.event.target.children.length;
  var i =0;
  var source_circles = []
  for(i=0;i<length_data;i++){
  	if(i>1){
  		source_circles.push(d3.event.target.children.item(i));
  		}
  	
  }
  // source_circles = d3.event.target.children.forEach(function(d,i){if(i>1){return d;}})
  target_circles = d3.select('.target_area')[0][0].children;
  target_length = target_circles.length;

  for(i=0;i<target_length;i++){
  	target_circles.item(i).style.fill=source_circles[i].style.fill;
  }
  d3.event.stopPropagation();
});

function compare_and_render_color(spec_array, data_array) {
	source_spec = spec_array[0];
	target_spec = spec_array[1];
	if(source_spec.encoding.color){
		var color_attribute = source_spec.encoding.color;
	}
	else{
		return;
	}
	field_type = color_attribute.type;
	possible_spec_array = [];
	target_data = data_array[1];
	data_item = target_data[0];
	data_type_per_field = {};
	for (var property in data_item){
		if(data_item.hasOwnProperty(property)){
			if(typeof data_item[property]==='string'){
				data_type_per_field[property] = "nominal";
			}
			else if (typeof data_item[property]==="number"){
				data_type_per_field[property]="quantitative";
			}
			else if(data_item[property] instanceof Date){
				data_type_per_field[property]="ordinal";
			}
		}
	}
	switch(field_type){
		case "quantitative":
			var quantitative_field = [];
			for(var property in data_type_per_field){
				if(data_type_per_field[property]=="quantitative"){
					quantitative_field.push(property)
				}
			}
			var tree = require('tree-kit');
			// var emp = require('fs');
			// var fs = require('file-system');
			quantitative_field.map(function(d,i){
				var copy = tree.clone(target_spec);
				copy.encoding.color = {"field":d,"type":"quantitative"}
				possible_spec_array.push(copy);
			});
			var title_reco = [];
			possible_spec_array.map(function(d,i){
				title_reco.push(d.encoding.color.field+'-'+ d.encoding.color.type+' field');
			});
			var recommendation_id = [];
			possible_spec_array.map(function(d,i){
				recommendation_id.push(i)
			});
			possible_spec_array.map(function(d,i){
				processScatterPlot(d,target_data,recommendation_id[i],title_reco[i]);
			});
			// possible_spec_array.map(function(d,i){
			// 		emp.writeFile("generated_json/"+i.toString()+".json", 'hey', function(err,data){
			// 			if(err){
			// 				return console.log(err);
			// 			}
			// 			console.log(data);
			// 		});
			// 	});
			break;
		case "nominal":
			var nominal_field = [];
			for(var property in data_type_per_field){
				if(data_type_per_field[property]=="nominal"){
					nominal_field.push(property)
				}
			}
			nominal_field.map(function(d,i){
				target_spec.encoding.color = {"field":d,"type":"nominal"}
				possible_spec_array.push(target_spec);
			});
			break;
		case "ordinal":
			var ordinal_field = [];
			for(var property in data_type_per_field){
				if(data_type_per_field[property]=="ordinal"){
					ordinal_field.push(property)
				}
			}
			ordinal_field.map(function(d,i){
				target_spec.encoding.color = {"field":d,"type":"temporal"}
				possible_spec_array.push(target_spec);
			});
			break;

	}

	return possible_spec_array;

}





var margin = {top: 30, right: 30, bottom: 30, left: 80}
            , width = 960 - margin.left - margin.right
            , height = 300 - margin.top - margin.bottom;

var spec_array = []; // contains no_color.json and quantitative_color.json
var data_array = []; // read the data

var q = d3.queue();  // making the process of reading files sequentional
q
.defer(d3.json,"quantitative_color_vega.json")
.defer(d3.json,"no_color.json")
.awaitAll(vega_ready);

function vega_ready(error, results){
	//  results will have two objects one contains no color and another contains quantitative_color_vega
	if(error) throw error;
	var files_to_be_read = [];
	spec_array = results;
	spec_array.map(function(d,i){ // getting the URL for each data file
		files_to_be_read.push(d.data.url);
	});

	var data_q = d3.queue();
	files_to_be_read.map(function(d,i){ // Reading each data
		URL = d;
		path_array = URL.split("/");
		filename = path_array[path_array.length-1];
		filetype = filename.split(".")[1];
		switch (filetype){
			case "csv":
				data_q.defer(d3.csv,URL);
				break;
			case "tsv":
				data_q.defer(d3.tsv,URL);
				break;
			case "json":
				data_q.defer(d3.json,URL);
				break;
			default:
				seperator = "|";
				var psv = d3.dsv("|","text/plain");
				psv(URL, function(filecontent){
					data = filecontent;
				});
		}
	});

	data_q.awaitAll(data_ready);
}

function data_ready(error,results){
	if(error) throw error;
	data_array = results;
	type_array = ['source', 'target']
	title_array = ['Cars data - colored by Displacement, a quantitative field', 'Chocolate data']
	data_array.map(function(d,i){
		switch (spec_array[i].mark){
			case "line":
				processLineChart(spec_array[i],data_array[i]);
				break;
			case "bar":
				processBarChart(spec_array[i],data_array[i]);
				break;
			case "point":
			case "circle":
			case "square":
				processScatterPlot(spec_array[i],data_array[i],type_array[i], title_array[i]);
				break;
}

	});

// other_specs = compare_and_render_color(spec_array, data_array);

}

},{"tree-kit":7}],9:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],10:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],11:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],12:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":11,"_process":9,"inherits":10}]},{},[8]);
