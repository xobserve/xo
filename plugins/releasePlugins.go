package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
)

/*
This script sync plugins code from dev directory to this directory, it can help developers conveniently sync their code from development environment to release environment.

dev directory: DATAV_ROOT/ui/src/views/dashboard/plugins/external
release directory: DATAV_ROOT/plugins
*/

const sourceDir = "../ui/src/views/dashboard/plugins/external"
const releaseDir = "."

func main() {
	args := os.Args
	if len(args) != 2 {
		log.Println("Usage: go run releasePlugins.go [panel|datasource].[pluginType]  e.g. go run releasePlugins.go panel.demo,datasource.demo")
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
				continue
			}
		}
	}

	log.Println("Release plugins code successfully!")

}
