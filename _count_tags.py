#application name
spring.application.name=datalink-om
spring.main.banner-mode=off
spring.jackson.date-format=yyyy-MM-dd HH:mm:ss
spring.jackson.time-zone=GMT+8
# mvc config(src/main/webapp)
spring.mvc.view.prefix=/WEB-INF/jsp/
spring.mvc.view.suffix=.jsp


#web server
server.port=8072
server.tomcat.uri-encoding=UTF-8
server.connection-timeout=30000
server.servlet.session.timeout=3600s
spring.servlet.multipart.max-file-size=200MB
spring.servlet.multipart.max-request-size=200MB
#jsp deployment
server.servlet.jsp.init-parameters.development=true


#spring.datasource.url=jdbc:dm://10.200.232.241:5236/DATALINK_OM?characterEncoding=utf-8
spring.datasource.url=jdbc:dm://127.0.0.1:5236/DATALINK_OM?characterEncoding=utf-8
spring.datasource.username=SYSDBA
spring.datasource.password=SYSDBA001
spring.datasource.driver-class-name=dm.jdbc.driver.DmDriver
spring.datasource.type=com.zaxxer.hikari.HikariDataSource
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.maximum-pool-size=30
spring.datasource.hikari.auto-commit=true
spring.datasource.hikari.pool-name=DatebookHikariCP
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.connection-test-query=SELECT 1
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.idle-timeout=600000
# Number of ms to wait before throwing an exception if no connection is available.
spring.datasource.tomcat.max-wait=10000
# Maximum number of active connections that can be allocated from this pool at the same time.
spring.datasource.tomcat.max-active=100
# Validate the connection before borrowing it from the pool.
spring.datasource.tomcat.test-on-borrow=true


# pagehelper
pagehelper.helperDialect=com.github.pagehelper.dialect.helper.OracleDialect
pagehelper.reasonable=true
pagehelper.supportMethodsArguments=true
pagehelper.params=count=countSql

#mybatis config
mybatis.config-locations=classpath:mybatis-config.xml
mybatis.mapper-locations=classpath:lj/mapper/**/*.xml
mybatis.type-aliases-package=lj.model
mybatis.configuration.call-setters-on-nulls=true

#
staticconfig.systemName=???????
staticconfig.defaultPassword=123456
staticconfig.uploadDir=E:\\13_upload\\uploaddl
staticconfig.algorithmAddress=http://127.0.0.1:8090
staticconfig.testWarnIp=255.255.255.255
staticconfig.testWarnPort=9001

