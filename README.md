# Datav

The open-source platform for monitoring and observability. 

Datav is forked from **@grafana**, but changed a lot, e.g :
- remove angular dependency, using pure react
- much cleaner code 
- a smaller but more extensible plugin system
- multi spoken languages supported
- large screen supported
- different team and acl design,no orgs any more 
- 100% free. Forever and always


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

2. Use famous and mature ui frameworks, DON'T DO IT OURSELVES
> DataV will use [antd](https://ant.design) as default ui framework, special themes will be globaly applied

3. Users from grafana MUST NOT pay too much on migration 
> Query api,import json format, panel plugins, variables these should be compatible with grafana

4. Keep our codes and core features clean and simple
> Code maintaing and re-developing shouldn't  be a nightmare.

5. The needs of the bosses must be taken into account
> Our bosses usually have different sights, so datav will take their needs too, e.g big screen dashboard, data report, **data association** etc


## Community
### Creator
- CodeMystery
### Contributors
- Sunface: Main contributor and chinese translator