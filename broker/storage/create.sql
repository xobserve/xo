CREATE TABLE `channel_storage` (
`id`  int NOT NULL AUTO_INCREMENT ,
`channel_name`  varchar(255) NOT NULL ,
`channel_tls`  bigint NULL ,
`createtime`  bigint  COMMENT '创建时间' ,
PRIMARY KEY (`id`)
);