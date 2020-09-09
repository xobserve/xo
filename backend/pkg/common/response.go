package common

import (
	"github.com/CodeCreatively/datav/backend/pkg/i18n"
)

type Response struct {
	Status string      `json:"status"`
	Data   interface{} `json:"data,omitempty"`

	// 1. I18n == true  : use message id to lookup i18n messages in ui
	// 2. I18n == false : for some common uses, e.g return detai error string
	I18n    bool   `json:"i18n"`
	Message string `json:"message,omitempty"`
}

func ResponseSuccess(d interface{}) *Response {
	res := &Response{}

	res.Status = Success
	if d != nil {
		res.Data = d
	}

	return res
}

func ResponseError(d interface{}) *Response {
	res := &Response{}

	res.Status = Error
	if d != nil {
		res.Data = d
	}

	return res
}

func ResponseSuccessMessage(d interface{}, i18n bool, msg string) *Response {
	res := &Response{}

	res.Status = Success
	if d != nil {
		res.Data = d
	}

	res.I18n = i18n
	res.Message = msg

	return res
}

func ResponseErrorMessage(d interface{}, i18n bool, msg string) *Response {
	res := &Response{}

	res.Status = Error
	if d != nil {
		res.Data = d
	}

	res.I18n = i18n
	res.Message = msg

	return res
}

func ResponseI18nError(msg string) *Response {
	res := &Response{}

	res.Status = Error
	res.I18n = i18n.ON
	res.Message = msg

	return res
}

func ResponseInternalError() *Response {
	res := &Response{}

	res.Status = Error
	res.I18n = i18n.ON
	res.Message = i18n.ServerInternalError

	return res
}
