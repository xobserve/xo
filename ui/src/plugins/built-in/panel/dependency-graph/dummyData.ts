import { QueryResponse } from "./types";

const dummyData: QueryResponse[] = [
    {
        columns: [
            {text: "source"},
            {text: "target"},
            {text: "requests"},
            {text: "errors"},
            {text: "response_time"},
            {text: "external_type"},
            {text: "protocol"}
        ],
        refId: undefined,
        rows: [
            ["localhost","api-gateway",1028,228,165816,1,"http"],
            ["api-gateway","customers-service",347,14,819,0,"grpc"],
            ["api-gateway","jdbc:hsqldb:mem:testdb",618,14,1819,2,"jdbc"],
            ["api-gateway","discovery-server",27,0,540,0,"http"],
            ["api-gateway","visits-service",100,0,400,0,"http"],
            ["api-gateway","vets-service",62,0,500,0,"http"],
            ["customers-service","discovery-server",20,20,80,0,"http"],
            ["visits-service","discovery-server",20,0,330,0,"http"],
            ["vets-service","discovery-server",20,0,380,0,"http"],
            ["vets-service","visits-service",300,0,4000,0,"http"],
            ["visits-service","vets-service",1,1,5000,0,"http"],
        ]
    }
]

export default dummyData;