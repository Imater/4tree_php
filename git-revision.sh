#!/bin/bash
revisioncount=`git log --oneline | wc -l`
projectversion=`git describe --tags --long`
cleanversion=${projectversion%%-*}

#echo "$projectversion-$revisioncount"
echo "$cleanversion.$revisioncount" | tr -d ' ' > !version.txt
echo "$cleanversion.$revisioncount" | tr -d ' '
git add !version.txt