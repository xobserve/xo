package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
)

// 1. 将 demo.svg 放入 public/plugins/external/panel 下
// 2. 新增 plugin.json 在 public/plugins/external/panel 下
// 3. 将 demo 代码文件夹移动到 src/views/dashboard/plugins/panel 下
// 4. 自动生成 src/views/dashboard/plugins/externalPlugins 文件

func main() {
	// Walk("./panel", true, true, walker)
	cmd := exec.Command("bash", "-c", "mkdir -p ../public/plugins/external/panel")
	cmd.CombinedOutput()

	cmd = exec.Command("bash", "-c", "mkdir -p ../public/plugins/external/datasource")
	cmd.CombinedOutput()

	// generate panel plugins
	panels, err := os.ReadDir("./panel")
	if err != nil {
		log.Fatal("read panel direrror", err)
	}

	pluginsList := make([]map[string]string, 0)

	for _, panel := range panels {
		panelType := panel.Name()
		// cp .svg to public/plugins/external/panel
		cmdStr := fmt.Sprintf("cp -r ./panel/%s/%s.svg ../public/plugins/external/panel", panelType, panelType)
		cmd := exec.Command("bash", "-c", cmdStr)
		if _, err := cmd.CombinedOutput(); err != nil {
			log.Println("copy plugin .svg  error: ", err, ", panel: ", panelType)
			continue
		}

		// cp panel codes into src/views/dashboard/plugins/panel
		cmdStr = fmt.Sprintf("cp -r ./panel/%s src/views/dashboard/plugins/panel", panelType)
		cmd = exec.Command("bash", "-c", cmdStr)
		if _, err := cmd.CombinedOutput(); err != nil {
			log.Println("copy plugin code dir  error: ", err, ", panel: ", panelType)
			continue
		}

		pluginsList = append(pluginsList, map[string]string{
			"type": panelType,
		})
	}

	// generate plugin.json for panels
	pluginsJson, _ := json.Marshal(pluginsList)
	err = os.WriteFile("../public/plugins/external/panel/plugins.json", pluginsJson, 0777)
	if err != nil {
		log.Fatal("write plugin.json error", err)
	}

	fmt.Println(err)
}

func walker(currentPath string, f os.FileInfo, err error) error {
	// We scan all the subfolders for plugin.json (with some exceptions) so that we also load embedded plugins, for
	// example https://github.com/raintank/worldping-app/tree/master/dist/grafana-worldmap-panel worldmap panel plugin
	// is embedded in worldping app.
	if err != nil {
		return err
	}

	// if f.IsDir() {
	// 	return nil
	// }

	fmt.Println(f)
	return nil
}

// ErrWalkSkipDir is the Error returned when we want to skip descending into a directory
var ErrWalkSkipDir = errors.New("skip this directory")

// WalkFunc is a callback function called for each path as a directory is walked
// If resolvedPath != "", then we are following symbolic links.
type WalkFunc func(resolvedPath string, info os.FileInfo, err error) error

// Walk walks a path, optionally following symbolic links, and for each path,
// it calls the walkFn passed.
//
// It is similar to filepath.Walk, except that it supports symbolic links and
// can detect infinite loops while following sym links.
// It solves the issue where your WalkFunc needs a path relative to the symbolic link
// (resolving links within walkfunc loses the path to the symbolic link for each traversal).
func Walk(path string, followSymlinks bool, detectSymlinkInfiniteLoop bool, walkFn WalkFunc) error {
	info, err := os.Lstat(path)
	if err != nil {
		return err
	}
	var symlinkPathsFollowed map[string]bool
	var resolvedPath string
	if followSymlinks {
		resolvedPath = path
		if detectSymlinkInfiniteLoop {
			symlinkPathsFollowed = make(map[string]bool, 8)
		}
	}
	return walk(path, info, resolvedPath, symlinkPathsFollowed, walkFn)
}

// walk walks the path. It is a helper/sibling function to Walk.
// It takes a resolvedPath into consideration. This way, paths being walked are
// always relative to the path argument, even if symbolic links were resolved).
//
// If resolvedPath is "", then we are not following symbolic links.
// If symlinkPathsFollowed is not nil, then we need to detect infinite loop.
func walk(path string, info os.FileInfo, resolvedPath string, symlinkPathsFollowed map[string]bool, walkFn WalkFunc) error {
	if info == nil {
		return errors.New("Walk: Nil FileInfo passed")
	}
	err := walkFn(resolvedPath, info, nil)
	if err != nil {
		if info.IsDir() && err == ErrWalkSkipDir {
			err = nil
		}
		return err
	}
	if resolvedPath != "" && info.Mode()&os.ModeSymlink == os.ModeSymlink {
		path2, err := os.Readlink(resolvedPath)
		if err != nil {
			return err
		}
		//vout("SymLink Path: %v, links to: %v", resolvedPath, path2)
		if symlinkPathsFollowed != nil {
			if _, ok := symlinkPathsFollowed[path2]; ok {
				errMsg := "Potential SymLink Infinite Loop. Path: %v, Link To: %v"
				return fmt.Errorf(errMsg, resolvedPath, path2)
			}
			symlinkPathsFollowed[path2] = true
		}
		info2, err := os.Lstat(path2)
		if err != nil {
			return err
		}
		return walk(path, info2, path2, symlinkPathsFollowed, walkFn)
	}
	if info.IsDir() {
		list, err := ioutil.ReadDir(path)
		if err != nil {
			return walkFn(resolvedPath, info, err)
		}
		var subFiles = make([]subFile, 0)
		for _, fileInfo := range list {
			path2 := filepath.Join(path, fileInfo.Name())
			var resolvedPath2 string
			if resolvedPath != "" {
				resolvedPath2 = filepath.Join(resolvedPath, fileInfo.Name())
			}
			subFiles = append(subFiles, subFile{path: path2, resolvedPath: resolvedPath2, fileInfo: fileInfo})
		}

		if containsDistFolder(subFiles) {
			err := walk(
				filepath.Join(path, "dist"),
				info,
				filepath.Join(resolvedPath, "dist"),
				symlinkPathsFollowed,
				walkFn)

			if err != nil {
				return err
			}
		} else {
			for _, p := range subFiles {
				err = walk(p.path, p.fileInfo, p.resolvedPath, symlinkPathsFollowed, walkFn)

				if err != nil {
					return err
				}
			}
		}

		return nil
	}
	return nil
}

type subFile struct {
	path, resolvedPath string
	fileInfo           os.FileInfo
}

func containsDistFolder(subFiles []subFile) bool {
	for _, p := range subFiles {
		if p.fileInfo.IsDir() && p.fileInfo.Name() == "dist" {
			return true
		}
	}

	return false
}

// Exists determines whether a file/directory exists or not.
func FileExists(fpath string) (bool, error) {
	_, err := os.Stat(fpath)
	if err != nil {
		if !os.IsNotExist(err) {
			return false, err
		}
		return false, nil
	}

	return true, nil
}
