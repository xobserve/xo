# Datav
The open-source platform for data monitoring and observability. 

Datav is forked from **@grafana**, but changed a lot, e.g :
- remove angular dependency, using pure react
- much better alerting features
- multi spoken languages supported
- large screen supported
- different team and acl design,no orgs any more 
- 100% free. Forever and always

## Status
v0.8.0 has been released, official website and docs will be released before 2020-11-13 .

## How to start(developing mode)
```bash
> git clone https://github.com/apm-ai/datav
> cd datav
> go build
> ./datav init
> ./datav generate
> ./datav &
> cd ui
> nvm use    
> yarn install
> yarn start
```
then open http://localhost:3000, and login with admin/admin



## Key Features 
- **Plugins** Performance,Extensible,Beautiful,Configurable
- **Dynamic Dashboards** Create dynamic & reusable dashboards with template variables
- **Beautifult Large Screen** Customize your own big data large screen,it's very very cool
- **Alerting** Visually define alert rules for your most important metrics
- **Powerful Iframe API** Embed datav to your website With powerful iframe api
- **Variables**  Global and Dashboard, global vars can help you achieve personalized features such as multiple environments
- **Teams and ACL** Besides global dashboards, you can create teams, manage and share dashboards in your team.


## Design Philosophy
Contrary to Grafana's big and all, DataV's design goal is small and beautiful.We support 90% of common usage scenarios.In these scenarios, DataV can ensure that it is simple enough and easy to use. Plug-in development will also be very simple. 

1. The special needs of users are left to themselves to do, **don't try to cover all scenarios**
> e.g Simplify datasources, only provide some most frequently-used metrics/logs/traces store, others willl be supported via standard http ways

2. Users from grafana MUST NOT pay too much on migration 
> Query api,import json format, panel plugins, variables these should be compatible with grafana

3. Keep our codes and core features clean and simple
> Code maintaing and re-developing shouldn't  be a nightmare.

4. The needs of the bosses must be taken into account
> Our bosses usually have different sights, so datav will take their needs too, e.g big screen dashboard, data report, **data association** etc

