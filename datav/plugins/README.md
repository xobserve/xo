## ObserveX external plugins

This directory contains the source code of external plugins which are developed by community. The external plugins are not included in the default plugins, you need to [build them manually](https://observex.io/docs/external-panel-install) to use them.

## Keep the source code if you need it

Please don't remove the plugins source code in this directory **if you still need it**, because every time you rebuild the plugins, the external plugins will be regenerated from the source code in this directory.

This means when source code is removed from this directory, it will be removed from the external plugins as well after you rebuild the plugins.


## removePlugin.go

This script will only remove the installed external plugin, but not the source code in this directory, you need to remove the source code manually if you don't need it anymore.

