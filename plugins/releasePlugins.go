package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
)

/*
This script sync plugins code from dev directory to this directory, it can help developers conveniently sync their code from development environment to release environment.

dev directory: OBSERVEX_ROOT/ui/src/views/dashboard/plugins/external
release directory: OBSERVEX_ROOT/plugins
*/

const sourceDir = "../ui/src/views/dashboard/plugins/external"
const releaseDir = "."
const querySourceDir = "../query/internal/plugins/external"

func main() {
	args := os.Args
	if len(args) != 2 {
		log.Println("Usage: go run releasePlugins.go [panel|datasource].[pluginType]  e.g. go run releasePlugins.go panel.demo,datasource.demo")
		log.Println("Usage: go run releasePlugins.go all")
		return
	}

	cmd := exec.Command("bash", "-c", "mkdir -p ./panel")
	cmd.CombinedOutput()

	cmd = exec.Command("bash", "-c", "mkdir -p ./datasource")
	cmd.CombinedOutput()

	if args[1] == "all" {
		panels, err := os.ReadDir(sourceDir + "/panel")
		if err != nil {
			log.Fatal("read panel dir error", err)
		}

		for _, panel := range panels {
			panelType := panel.Name()

			// cp panel dir to public/plugins/external/panel
			cmdStr := fmt.Sprintf("cp -r %s/panel/%s %s/panel", sourceDir, panelType, releaseDir)
			cmd := exec.Command("bash", "-c", cmdStr)
			if _, err := cmd.CombinedOutput(); err != nil {
				log.Println("copy panel plugin codes error: ", err, ", panel: ", panelType)
				continue
			}
		}

		datasources, err := os.ReadDir(sourceDir + "/datasource")
		if err != nil {
			log.Fatal("read datasource dir error", err)
		}

		for _, ds := range datasources {
			dsType := ds.Name()

			// cp panel dir to public/plugins/external/panel
			cmdStr := fmt.Sprintf("cp -r %s/datasource/%s %s/datasource", sourceDir, dsType, releaseDir)
			cmd := exec.Command("bash", "-c", cmdStr)
			if _, err := cmd.CombinedOutput(); err != nil {
				log.Println("copy datasource plugin codes error: ", err, ", datasource: ", dsType)
			}
		}

		queryPlugins, err := os.ReadDir(querySourceDir)
		if err != nil {
			log.Fatal("read query plugins dir error", err)
		}

		for _, ds := range queryPlugins {
			dsType := ds.Name()

			// cp panel dir to public/plugins/external/panel
			cmdStr := fmt.Sprintf("cp -r %s/%s %s/query", querySourceDir, dsType, releaseDir)
			cmd := exec.Command("bash", "-c", cmdStr)
			if _, err := cmd.CombinedOutput(); err != nil {
				log.Println("copy query plugin codes error: ", err, ", query plugin: ", dsType)
			}
		}
	} else {
		list := strings.Split(args[1], ",")

		for _, plugin := range list {
			p := strings.Split(plugin, ".")
			if len(p) != 2 {
				log.Println("Plugin to be release must be [panel|datasource].[pluginType]  e.g. panel.demo,datasource.demo")
				return
			}

			tp := p[0]
			if tp != "panel" && tp != "datasource" && tp != "query" {
				log.Println(tp + "is not a valid plugin type, plugin type only support panel , datasource or query,  Usage: e.g. go run releasePlugin.go panel.demo,datasource.demo , this will release panel plugin demo and also release datasource plugin demo")
				return
			}

			pluginType := p[1]

			var cmdStr string
			if tp == "query" {
				cmdStr = fmt.Sprintf("cp -r %s/%s %s/query", querySourceDir, pluginType, releaseDir)
			} else {
				cmdStr = fmt.Sprintf("cp -r %s/%s/%s %s/%s", sourceDir, tp, pluginType, releaseDir, tp)
			}
			cmd := exec.Command("bash", "-c", cmdStr)
			if _, err := cmd.CombinedOutput(); err != nil {
				log.Println("copy plugin codes error: ", err, ", type: ", plugin)
			}
		}
	}

	log.Println("Release plugins code successfully!")

}
