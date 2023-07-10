// Forked from https://github.com/mafintosh/json-markup/blob/master/index.js
//
// The MIT License (MIT)
//
// Copyright (c) 2023 The Jaeger Authors
// Copyright (c) 2014 Mathias Buus
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// 'use strict'

const INDENT = '    ';

function type(doc) {
  if (doc === null) return 'null';
  if (Array.isArray(doc)) return 'array';
  if (typeof doc === 'string' && /^https?:/.test(doc)) {
    try {
      const u = new URL(doc);
      return 'link';
    } catch {
      // malformed URL
      return 'string';
    }
  }
  return typeof doc;
}

function escape(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function jsonMarkup(doc, styleFile) {
  var indent = '';
  function style(cssClass) {
    return 'class="' + cssClass + '"';
  }

  var forEach = function (list, start, end, fn) {
    if (!list.length) return start + ' ' + end;

    var out = start + '\n';

    indent += INDENT;
    list.forEach(function (key, i) {
      out += indent + fn(key) + (i < list.length - 1 ? ',' : '') + '\n';
    });
    indent = indent.slice(0, -INDENT.length);

    return out + indent + end;
  };

  function visit(obj) {
    if (obj === undefined) return '';

    switch (type(obj)) {
      case 'boolean':
        return '<span ' + style('json-markup-bool') + '>' + obj + '</span>';

      case 'number':
        return '<span ' + style('json-markup-number') + '>' + obj + '</span>';

      case 'null':
        return '<span ' + style('json-markup-null') + '>null</span>';

      case 'string':
        return (
          '<span ' +
          style('json-markup-string') +
          '>"' +
          escape(obj.replace(/\n/g, '\n' + indent)) +
          '"</span>'
        );

      case 'link':
        let url = new URL(obj);
        return (
          '<span ' + style('json-markup-string') + '>"<a href="' + url.href + '">' + url.href + '</a>"</span>'
        );

      case 'array':
        return forEach(obj, '[', ']', visit);

      case 'object':
        var keys = Object.keys(obj).filter(function (key) {
          return obj[key] !== undefined;
        });

        return forEach(keys, '{', '}', function (key) {
          return '<span ' + style('json-markup-key') + '>"' + escape(key) + '":</span> ' + visit(obj[key]);
        });
    }

    return '';
  }

  return '<div ' + style('json-markup') + '>' + visit(doc) + '</div>';
}
