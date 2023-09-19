<p align="center">
  <img src="https://datav.io/logo.png" alt="datav-logo" width="120" />
</p>


<h2 align="center">
  Most powerful data visulization platform for APM and Observability, 100% open-source.
</h2>

<p align="center">
    <img alt="License" src="https://img.shields.io/badge/license-Apache2.0-brightgreen"> 
    <a href="/https://github.com/data-observe/datav/blob/main/README_CN.md"><img alt="Chinese readme" src="https://img.shields.io/badge/中文-Readme-brightgreen"></a>
</p>

- Website: https://datav.io
- Online Demo: https://play.datav.io


## What is datav
<p>Datav is a very new and modern data visualization platform, you can think it as a modern version of Grafana. </p>

<p>You can visualize metrics, traces, and logs from various datasource, and correlate them easily and deeply.</p>

<p>It sounds like Datav is much like Grafana , but it doesn't </p>

## Compare to Grafana

Grafana is a great product, and it is the most popular dashboarding tool in the world. But Datav has its own adavantages: 

1. **Native support for observability**
2. **Build the panels as you like**, comparing to Grafana, Datav provides much more panel settings for you to build your own powerful panel.
3. **Much better dashboard interactivity**, such as custom your own jumping events between traces, logs and metrics, like the video [below](#interactivity)
4. **Better performance**, unlike grafana, codebase in Datav are very clean and simple: we only use React.js and Vite.js, so any bugs and performance issues are easy to resolved
5. **Sidebar menu can be customized in Datav**. 
   you can also use other team's sidebar menu, that is very powerful for building a observability platform.
6. **Easier to use and redevelop:**
  
   Datav is much easier to use than Grafana, especially for developers. If you has dig into Grafana's codebase, you should know what I mean. In a word, Datav is much 
7. **Much better APM and Observability features**

    Datav is much more powerful in Observability and APM fields. Besides the basic dashboarding features, you can 

    - Provide various kinds of interactivity
    - Custom dashboard styles to provide a beautiful large screen dispaly 
    - Teams can build their own sidemenu to provice better navigation features
    - Global variables to provide global context: select in one place, effect everywhere, e.g applications, environments, etc. 
    - General HTTP datasource and Echarts panel, you can build everything you want with them 
    - Custom your own data processing logic with Javascript, transform your data to any format you want

    In a word, **you can use Datav to build any kinds of APM UI**! We provide you nearly all the tools you need. 

    As comparison, grafana is focusing on exploring data, which make it impossible to meet what APM and Observability really needs.

8. **Beautiful and customizable UI**

    As datav is a new product, we have a chance to build a modern and beautiful UI from scratch. 

    You can customize dashboard and panel styles to build beautiful dashboard, even you can build a large screen display with Datav, maybe your Boss will like it :)

9. **Better open-source License**

    Datav is using Apache License 2.0, which is more friendly to commercial use.

    We promise: **we will never CHANGE LICENSE and CLOSE-SOURCE in the future, datav is and will be 100% open source forever**!


<!-- 
## Visitors Count

<img align="left" src = "https://profile-counter.glitch.me/datav/count.svg" alt ="Loading"> -->




## Demo images

### Interactivity

<video src="https://github.com/data-observe/assets/blob/main/datav-readme/interactions.mov?raw=true"  />