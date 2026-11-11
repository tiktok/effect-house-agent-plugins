@echo off
rem Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
rem SPDX-License-Identifier: Apache-2.0
set "EHAI_NODE=%EHAI_HOME%"
if not defined EHAI_NODE set "EHAI_NODE=%USERPROFILE%\.ehai"
set "EHAI_NODE=%EHAI_NODE%\runtime\current\lib\node_modules\ehai\bin\node.exe"
if not exist "%EHAI_NODE%" set "EHAI_NODE=node"
"%EHAI_NODE%" "%~dp0start.mjs" %*
