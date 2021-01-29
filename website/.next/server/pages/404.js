module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../ssr-module-cache.js');
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./pages/404.tsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./configs/site-config.ts":
/*!********************************!*\
  !*** ./configs/site-config.ts ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nconst baseUrl = \"https://github.com/chakra-ui/chakra-ui\";\nconst siteConfig = {\n  copyright: `Copyright © ${new Date().getFullYear()} Segun Adebayo. All Rights Reserved.`,\n  algolia: {\n    apiKey: \"df1dcc41f7b8e5d68e73dd56d1e19701\",\n    indexName: \"chakra-ui\",\n    inputSelector: \"#algolia-search\"\n  },\n  author: {\n    name: \"Segun Adebayo\",\n    github: \"https://github.com/segunadebayo\",\n    twitter: \"https://twitter.com/thesegunadebayo\",\n    linkedin: \"https://linkedin.com/in/thesegunadebayo\",\n    email: \"sage@adebayosegun.com\"\n  },\n  repo: {\n    url: baseUrl,\n    editUrl: `${baseUrl}/edit/develop/website`,\n    blobUrl: `${baseUrl}/blob/develop`\n  },\n  openCollective: {\n    url: \"https://opencollective.com/chakra-ui\"\n  },\n  discord: {\n    url: \"https://discord.gg/dQHfcWF\"\n  },\n  seo: {\n    title: \"Chakra UI\",\n    titleTemplate: \"%s - Chakra UI\",\n    description: \"Simple, Modular and Accessible UI Components for your React Applications.\",\n    siteUrl: \"https://chakra-ui.com\",\n    twitter: {\n      handle: \"@chakra-ui\",\n      site: \"@chakra-ui\",\n      cardType: \"summary_large_image\"\n    },\n    openGraph: {\n      type: \"website\",\n      locale: \"en_US\",\n      url: \"https://chakra-ui.com\",\n      title: \"Chakra UI\",\n      description: \"Simple, Modular and Accessible UI Components for your React Applications.\",\n      site_name: \"Chakra UI: Simple, Modular and Accessible UI Components for your React Applications.\",\n      images: [{\n        url: \"/og-image.png\",\n        width: 1240,\n        height: 480,\n        alt: \"Chakra UI: Simple, Modular and Accessible UI Components for your React Applications.\"\n      }, {\n        url: \"/twitter-og-image.png\",\n        width: 1012,\n        height: 506,\n        alt: \"Chakra UI: Simple, Modular and Accessible UI Components for your React Applications.\"\n      }]\n    }\n  }\n};\n/* harmony default export */ __webpack_exports__[\"default\"] = (siteConfig);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9jb25maWdzL3NpdGUtY29uZmlnLnRzPzk4OGIiXSwibmFtZXMiOlsiYmFzZVVybCIsInNpdGVDb25maWciLCJjb3B5cmlnaHQiLCJEYXRlIiwiZ2V0RnVsbFllYXIiLCJhbGdvbGlhIiwiYXBpS2V5IiwiaW5kZXhOYW1lIiwiaW5wdXRTZWxlY3RvciIsImF1dGhvciIsIm5hbWUiLCJnaXRodWIiLCJ0d2l0dGVyIiwibGlua2VkaW4iLCJlbWFpbCIsInJlcG8iLCJ1cmwiLCJlZGl0VXJsIiwiYmxvYlVybCIsIm9wZW5Db2xsZWN0aXZlIiwiZGlzY29yZCIsInNlbyIsInRpdGxlIiwidGl0bGVUZW1wbGF0ZSIsImRlc2NyaXB0aW9uIiwic2l0ZVVybCIsImhhbmRsZSIsInNpdGUiLCJjYXJkVHlwZSIsIm9wZW5HcmFwaCIsInR5cGUiLCJsb2NhbGUiLCJzaXRlX25hbWUiLCJpbWFnZXMiLCJ3aWR0aCIsImhlaWdodCIsImFsdCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFNQSxPQUFPLEdBQUcsd0NBQWhCO0FBRUEsTUFBTUMsVUFBVSxHQUFHO0FBQ2pCQyxXQUFTLEVBQUcsZUFBYyxJQUFJQyxJQUFKLEdBQVdDLFdBQVgsRUFBeUIsc0NBRGxDO0FBRWpCQyxTQUFPLEVBQUU7QUFDUEMsVUFBTSxFQUFFLGtDQUREO0FBRVBDLGFBQVMsRUFBRSxXQUZKO0FBR1BDLGlCQUFhLEVBQUU7QUFIUixHQUZRO0FBT2pCQyxRQUFNLEVBQUU7QUFDTkMsUUFBSSxFQUFFLGVBREE7QUFFTkMsVUFBTSxFQUFFLGlDQUZGO0FBR05DLFdBQU8sRUFBRSxxQ0FISDtBQUlOQyxZQUFRLEVBQUUseUNBSko7QUFLTkMsU0FBSyxFQUFFO0FBTEQsR0FQUztBQWNqQkMsTUFBSSxFQUFFO0FBQ0pDLE9BQUcsRUFBRWhCLE9BREQ7QUFFSmlCLFdBQU8sRUFBRyxHQUFFakIsT0FBUSx1QkFGaEI7QUFHSmtCLFdBQU8sRUFBRyxHQUFFbEIsT0FBUTtBQUhoQixHQWRXO0FBbUJqQm1CLGdCQUFjLEVBQUU7QUFDZEgsT0FBRyxFQUFFO0FBRFMsR0FuQkM7QUFzQmpCSSxTQUFPLEVBQUU7QUFDUEosT0FBRyxFQUFFO0FBREUsR0F0QlE7QUF5QmpCSyxLQUFHLEVBQUU7QUFDSEMsU0FBSyxFQUFFLFdBREo7QUFFSEMsaUJBQWEsRUFBRSxnQkFGWjtBQUdIQyxlQUFXLEVBQ1QsMkVBSkM7QUFLSEMsV0FBTyxFQUFFLHVCQUxOO0FBTUhiLFdBQU8sRUFBRTtBQUNQYyxZQUFNLEVBQUUsWUFERDtBQUVQQyxVQUFJLEVBQUUsWUFGQztBQUdQQyxjQUFRLEVBQUU7QUFISCxLQU5OO0FBV0hDLGFBQVMsRUFBRTtBQUNUQyxVQUFJLEVBQUUsU0FERztBQUVUQyxZQUFNLEVBQUUsT0FGQztBQUdUZixTQUFHLEVBQUUsdUJBSEk7QUFJVE0sV0FBSyxFQUFFLFdBSkU7QUFLVEUsaUJBQVcsRUFDVCwyRUFOTztBQU9UUSxlQUFTLEVBQ1Asc0ZBUk87QUFTVEMsWUFBTSxFQUFFLENBQ047QUFDRWpCLFdBQUcsRUFBRSxlQURQO0FBRUVrQixhQUFLLEVBQUUsSUFGVDtBQUdFQyxjQUFNLEVBQUUsR0FIVjtBQUlFQyxXQUFHLEVBQ0Q7QUFMSixPQURNLEVBUU47QUFDRXBCLFdBQUcsRUFBRSx1QkFEUDtBQUVFa0IsYUFBSyxFQUFFLElBRlQ7QUFHRUMsY0FBTSxFQUFFLEdBSFY7QUFJRUMsV0FBRyxFQUNEO0FBTEosT0FSTTtBQVRDO0FBWFI7QUF6QlksQ0FBbkI7QUFpRWVuQyx5RUFBZiIsImZpbGUiOiIuL2NvbmZpZ3Mvc2l0ZS1jb25maWcudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBiYXNlVXJsID0gXCJodHRwczovL2dpdGh1Yi5jb20vY2hha3JhLXVpL2NoYWtyYS11aVwiXG5cbmNvbnN0IHNpdGVDb25maWcgPSB7XG4gIGNvcHlyaWdodDogYENvcHlyaWdodCDCqSAke25ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKX0gU2VndW4gQWRlYmF5by4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5gLFxuICBhbGdvbGlhOiB7XG4gICAgYXBpS2V5OiBcImRmMWRjYzQxZjdiOGU1ZDY4ZTczZGQ1NmQxZTE5NzAxXCIsXG4gICAgaW5kZXhOYW1lOiBcImNoYWtyYS11aVwiLFxuICAgIGlucHV0U2VsZWN0b3I6IFwiI2FsZ29saWEtc2VhcmNoXCIsXG4gIH0sXG4gIGF1dGhvcjoge1xuICAgIG5hbWU6IFwiU2VndW4gQWRlYmF5b1wiLFxuICAgIGdpdGh1YjogXCJodHRwczovL2dpdGh1Yi5jb20vc2VndW5hZGViYXlvXCIsXG4gICAgdHdpdHRlcjogXCJodHRwczovL3R3aXR0ZXIuY29tL3RoZXNlZ3VuYWRlYmF5b1wiLFxuICAgIGxpbmtlZGluOiBcImh0dHBzOi8vbGlua2VkaW4uY29tL2luL3RoZXNlZ3VuYWRlYmF5b1wiLFxuICAgIGVtYWlsOiBcInNhZ2VAYWRlYmF5b3NlZ3VuLmNvbVwiLFxuICB9LFxuICByZXBvOiB7XG4gICAgdXJsOiBiYXNlVXJsLFxuICAgIGVkaXRVcmw6IGAke2Jhc2VVcmx9L2VkaXQvZGV2ZWxvcC93ZWJzaXRlYCxcbiAgICBibG9iVXJsOiBgJHtiYXNlVXJsfS9ibG9iL2RldmVsb3BgLFxuICB9LFxuICBvcGVuQ29sbGVjdGl2ZToge1xuICAgIHVybDogXCJodHRwczovL29wZW5jb2xsZWN0aXZlLmNvbS9jaGFrcmEtdWlcIixcbiAgfSxcbiAgZGlzY29yZDoge1xuICAgIHVybDogXCJodHRwczovL2Rpc2NvcmQuZ2cvZFFIZmNXRlwiLFxuICB9LFxuICBzZW86IHtcbiAgICB0aXRsZTogXCJDaGFrcmEgVUlcIixcbiAgICB0aXRsZVRlbXBsYXRlOiBcIiVzIC0gQ2hha3JhIFVJXCIsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICBcIlNpbXBsZSwgTW9kdWxhciBhbmQgQWNjZXNzaWJsZSBVSSBDb21wb25lbnRzIGZvciB5b3VyIFJlYWN0IEFwcGxpY2F0aW9ucy5cIixcbiAgICBzaXRlVXJsOiBcImh0dHBzOi8vY2hha3JhLXVpLmNvbVwiLFxuICAgIHR3aXR0ZXI6IHtcbiAgICAgIGhhbmRsZTogXCJAY2hha3JhLXVpXCIsXG4gICAgICBzaXRlOiBcIkBjaGFrcmEtdWlcIixcbiAgICAgIGNhcmRUeXBlOiBcInN1bW1hcnlfbGFyZ2VfaW1hZ2VcIixcbiAgICB9LFxuICAgIG9wZW5HcmFwaDoge1xuICAgICAgdHlwZTogXCJ3ZWJzaXRlXCIsXG4gICAgICBsb2NhbGU6IFwiZW5fVVNcIixcbiAgICAgIHVybDogXCJodHRwczovL2NoYWtyYS11aS5jb21cIixcbiAgICAgIHRpdGxlOiBcIkNoYWtyYSBVSVwiLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiU2ltcGxlLCBNb2R1bGFyIGFuZCBBY2Nlc3NpYmxlIFVJIENvbXBvbmVudHMgZm9yIHlvdXIgUmVhY3QgQXBwbGljYXRpb25zLlwiLFxuICAgICAgc2l0ZV9uYW1lOlxuICAgICAgICBcIkNoYWtyYSBVSTogU2ltcGxlLCBNb2R1bGFyIGFuZCBBY2Nlc3NpYmxlIFVJIENvbXBvbmVudHMgZm9yIHlvdXIgUmVhY3QgQXBwbGljYXRpb25zLlwiLFxuICAgICAgaW1hZ2VzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB1cmw6IFwiL29nLWltYWdlLnBuZ1wiLFxuICAgICAgICAgIHdpZHRoOiAxMjQwLFxuICAgICAgICAgIGhlaWdodDogNDgwLFxuICAgICAgICAgIGFsdDpcbiAgICAgICAgICAgIFwiQ2hha3JhIFVJOiBTaW1wbGUsIE1vZHVsYXIgYW5kIEFjY2Vzc2libGUgVUkgQ29tcG9uZW50cyBmb3IgeW91ciBSZWFjdCBBcHBsaWNhdGlvbnMuXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB1cmw6IFwiL3R3aXR0ZXItb2ctaW1hZ2UucG5nXCIsXG4gICAgICAgICAgd2lkdGg6IDEwMTIsXG4gICAgICAgICAgaGVpZ2h0OiA1MDYsXG4gICAgICAgICAgYWx0OlxuICAgICAgICAgICAgXCJDaGFrcmEgVUk6IFNpbXBsZSwgTW9kdWxhciBhbmQgQWNjZXNzaWJsZSBVSSBDb21wb25lbnRzIGZvciB5b3VyIFJlYWN0IEFwcGxpY2F0aW9ucy5cIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgfSxcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2l0ZUNvbmZpZ1xuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./configs/site-config.ts\n");

/***/ }),

/***/ "./pages/404.tsx":
/*!***********************!*\
  !*** ./pages/404.tsx ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var components_seo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! components/seo */ \"./src/components/seo.tsx\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);\n\n\nvar _jsxFileName = \"/Users/sunfei/Downloads/website/pages/404.tsx\";\n\n\n\nconst NotFoundPage = () => /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"Fragment\"], {\n  children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(components_seo__WEBPACK_IMPORTED_MODULE_1__[\"default\"], {\n    title: \"404: Not found\",\n    description: \"Page not found\"\n  }, void 0, false, {\n    fileName: _jsxFileName,\n    lineNumber: 6,\n    columnNumber: 5\n  }, undefined), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"h1\", {\n    children: \"NOT FOUND\"\n  }, void 0, false, {\n    fileName: _jsxFileName,\n    lineNumber: 7,\n    columnNumber: 5\n  }, undefined), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"p\", {\n    children: \"You just hit a route that doesn't exist... the sadness.\"\n  }, void 0, false, {\n    fileName: _jsxFileName,\n    lineNumber: 8,\n    columnNumber: 5\n  }, undefined)]\n}, void 0, true);\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (NotFoundPage);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy80MDQudHN4PzA1ZGMiXSwibmFtZXMiOlsiTm90Rm91bmRQYWdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBOztBQUVBLE1BQU1BLFlBQVksR0FBRyxtQkFDbkI7QUFBQSwwQkFDRSxxRUFBQyxzREFBRDtBQUFLLFNBQUssRUFBQyxnQkFBWDtBQUE0QixlQUFXLEVBQUM7QUFBeEM7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQURGLGVBRUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFGRixlQUdFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBSEY7QUFBQSxnQkFERjs7QUFRZUEsMkVBQWYiLCJmaWxlIjoiLi9wYWdlcy80MDQudHN4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNFTyBmcm9tIFwiY29tcG9uZW50cy9zZW9cIlxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiXG5cbmNvbnN0IE5vdEZvdW5kUGFnZSA9ICgpID0+IChcbiAgPD5cbiAgICA8U0VPIHRpdGxlPVwiNDA0OiBOb3QgZm91bmRcIiBkZXNjcmlwdGlvbj1cIlBhZ2Ugbm90IGZvdW5kXCIgLz5cbiAgICA8aDE+Tk9UIEZPVU5EPC9oMT5cbiAgICA8cD5Zb3UganVzdCBoaXQgYSByb3V0ZSB0aGF0IGRvZXNuJiMzOTt0IGV4aXN0Li4uIHRoZSBzYWRuZXNzLjwvcD5cbiAgPC8+XG4pXG5cbmV4cG9ydCBkZWZhdWx0IE5vdEZvdW5kUGFnZVxuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/404.tsx\n");

/***/ }),

/***/ "./src/components/seo.tsx":
/*!********************************!*\
  !*** ./src/components/seo.tsx ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_seo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-seo */ \"next-seo\");\n/* harmony import */ var next_seo__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_seo__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var configs_site_config__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! configs/site-config */ \"./configs/site-config.ts\");\n\nvar _jsxFileName = \"/Users/sunfei/Downloads/website/src/components/seo.tsx\";\n\n\n\n\nconst SEO = ({\n  title,\n  description\n}) => /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(next_seo__WEBPACK_IMPORTED_MODULE_2__[\"NextSeo\"], {\n  title: title,\n  description: description,\n  openGraph: {\n    title,\n    description\n  },\n  titleTemplate: configs_site_config__WEBPACK_IMPORTED_MODULE_3__[\"default\"].seo.titleTemplate\n}, void 0, false, {\n  fileName: _jsxFileName,\n  lineNumber: 8,\n  columnNumber: 3\n}, undefined);\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (SEO);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9zZW8udHN4PzFmYzciXSwibmFtZXMiOlsiU0VPIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsInNpdGVDb25maWciLCJzZW8iLCJ0aXRsZVRlbXBsYXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBOztBQUlBLE1BQU1BLEdBQUcsR0FBRyxDQUFDO0FBQUVDLE9BQUY7QUFBU0M7QUFBVCxDQUFELGtCQUNWLHFFQUFDLGdEQUFEO0FBQ0UsT0FBSyxFQUFFRCxLQURUO0FBRUUsYUFBVyxFQUFFQyxXQUZmO0FBR0UsV0FBUyxFQUFFO0FBQUVELFNBQUY7QUFBU0M7QUFBVCxHQUhiO0FBSUUsZUFBYSxFQUFFQywyREFBVSxDQUFDQyxHQUFYLENBQWVDO0FBSmhDO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFERjs7QUFTZUwsa0VBQWYiLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9zZW8udHN4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiXG5pbXBvcnQgeyBOZXh0U2VvLCBOZXh0U2VvUHJvcHMgfSBmcm9tIFwibmV4dC1zZW9cIlxuaW1wb3J0IHNpdGVDb25maWcgZnJvbSBcImNvbmZpZ3Mvc2l0ZS1jb25maWdcIlxuXG5leHBvcnQgaW50ZXJmYWNlIFNFT1Byb3BzIGV4dGVuZHMgUGljazxOZXh0U2VvUHJvcHMsIFwidGl0bGVcIiB8IFwiZGVzY3JpcHRpb25cIj4ge31cblxuY29uc3QgU0VPID0gKHsgdGl0bGUsIGRlc2NyaXB0aW9uIH06IFNFT1Byb3BzKSA9PiAoXG4gIDxOZXh0U2VvXG4gICAgdGl0bGU9e3RpdGxlfVxuICAgIGRlc2NyaXB0aW9uPXtkZXNjcmlwdGlvbn1cbiAgICBvcGVuR3JhcGg9e3sgdGl0bGUsIGRlc2NyaXB0aW9uIH19XG4gICAgdGl0bGVUZW1wbGF0ZT17c2l0ZUNvbmZpZy5zZW8udGl0bGVUZW1wbGF0ZX1cbiAgLz5cbilcblxuZXhwb3J0IGRlZmF1bHQgU0VPXG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/components/seo.tsx\n");

/***/ }),

/***/ "next-seo":
/*!***************************!*\
  !*** external "next-seo" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"next-seo\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJuZXh0LXNlb1wiPzJjYmUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEiLCJmaWxlIjoibmV4dC1zZW8uanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJuZXh0LXNlb1wiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///next-seo\n");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZWFjdFwiPzU4OGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEiLCJmaWxlIjoicmVhY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWFjdFwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///react\n");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react/jsx-dev-runtime\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJyZWFjdC9qc3gtZGV2LXJ1bnRpbWVcIj9jZDkwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6InJlYWN0L2pzeC1kZXYtcnVudGltZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlYWN0L2pzeC1kZXYtcnVudGltZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///react/jsx-dev-runtime\n");

/***/ })

/******/ });