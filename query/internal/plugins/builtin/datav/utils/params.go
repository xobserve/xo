package utils

func GetNamespaceServiceHostFromParams(params map[string]interface{}) (namespace string, service string, host string) {
	namespaceI := params["namespace"]
	if namespaceI != nil {
		namespace = namespaceI.(string)
	}

	serviceI := params["service"]
	if serviceI != nil {
		service = serviceI.(string)
	}

	hostI := params["host"]
	if hostI != nil {
		host = hostI.(string)
	}

	return
}
