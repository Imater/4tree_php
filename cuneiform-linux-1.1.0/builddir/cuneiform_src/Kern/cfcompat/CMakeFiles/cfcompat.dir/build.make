# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 2.8

#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canoncical targets will work.
.SUFFIXES:

# Remove some rules from gmake that .SUFFIXES does not remove.
SUFFIXES =

.SUFFIXES: .hpux_make_needs_suffix_list

# Suppress display of executed commands.
$(VERBOSE).SILENT:

# A target that is always out of date.
cmake_force:
.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /usr/bin/cmake

# The command to remove a file.
RM = /usr/bin/cmake -E remove -f

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir

# Include any dependencies generated for this target.
include cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/depend.make

# Include the progress variables for this target.
include cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/progress.make

# Include the compile flags for this target's objects.
include cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/flags.make

cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o: cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/flags.make
cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o: ../cuneiform_src/Kern/cfcompat/cfcompat.c
	$(CMAKE_COMMAND) -E cmake_progress_report /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir/CMakeFiles $(CMAKE_PROGRESS_1)
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Building C object cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o"
	cd /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir/cuneiform_src/Kern/cfcompat && /usr/bin/gcc  $(C_DEFINES) $(C_FLAGS) -o CMakeFiles/cfcompat.dir/cfcompat.c.o   -c /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/cuneiform_src/Kern/cfcompat/cfcompat.c

cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing C source to CMakeFiles/cfcompat.dir/cfcompat.c.i"
	cd /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir/cuneiform_src/Kern/cfcompat && /usr/bin/gcc  $(C_DEFINES) $(C_FLAGS) -E /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/cuneiform_src/Kern/cfcompat/cfcompat.c > CMakeFiles/cfcompat.dir/cfcompat.c.i

cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling C source to assembly CMakeFiles/cfcompat.dir/cfcompat.c.s"
	cd /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir/cuneiform_src/Kern/cfcompat && /usr/bin/gcc  $(C_DEFINES) $(C_FLAGS) -S /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/cuneiform_src/Kern/cfcompat/cfcompat.c -o CMakeFiles/cfcompat.dir/cfcompat.c.s

cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o.requires:
.PHONY : cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o.requires

cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o.provides: cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o.requires
	$(MAKE) -f cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/build.make cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o.provides.build
.PHONY : cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o.provides

cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o.provides.build: cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o
.PHONY : cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o.provides.build

# Object files for target cfcompat
cfcompat_OBJECTS = \
"CMakeFiles/cfcompat.dir/cfcompat.c.o"

# External object files for target cfcompat
cfcompat_EXTERNAL_OBJECTS =

cuneiform_src/Kern/cfcompat/libcfcompat.so.1.1.0: cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o
cuneiform_src/Kern/cfcompat/libcfcompat.so.1.1.0: /usr/lib/libdl.so
cuneiform_src/Kern/cfcompat/libcfcompat.so.1.1.0: cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/build.make
cuneiform_src/Kern/cfcompat/libcfcompat.so.1.1.0: cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --red --bold "Linking C shared library libcfcompat.so"
	cd /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir/cuneiform_src/Kern/cfcompat && $(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/cfcompat.dir/link.txt --verbose=$(VERBOSE)
	cd /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir/cuneiform_src/Kern/cfcompat && $(CMAKE_COMMAND) -E cmake_symlink_library libcfcompat.so.1.1.0 libcfcompat.so.0 libcfcompat.so

cuneiform_src/Kern/cfcompat/libcfcompat.so.0: cuneiform_src/Kern/cfcompat/libcfcompat.so.1.1.0

cuneiform_src/Kern/cfcompat/libcfcompat.so: cuneiform_src/Kern/cfcompat/libcfcompat.so.1.1.0

# Rule to build all files generated by this target.
cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/build: cuneiform_src/Kern/cfcompat/libcfcompat.so
.PHONY : cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/build

# Object files for target cfcompat
cfcompat_OBJECTS = \
"CMakeFiles/cfcompat.dir/cfcompat.c.o"

# External object files for target cfcompat
cfcompat_EXTERNAL_OBJECTS =

cuneiform_src/Kern/cfcompat/CMakeFiles/CMakeRelink.dir/libcfcompat.so.1.1.0: cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o
cuneiform_src/Kern/cfcompat/CMakeFiles/CMakeRelink.dir/libcfcompat.so.1.1.0: /usr/lib/libdl.so
cuneiform_src/Kern/cfcompat/CMakeFiles/CMakeRelink.dir/libcfcompat.so.1.1.0: cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/build.make
cuneiform_src/Kern/cfcompat/CMakeFiles/CMakeRelink.dir/libcfcompat.so.1.1.0: cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/relink.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --red --bold "Linking C shared library CMakeFiles/CMakeRelink.dir/libcfcompat.so"
	cd /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir/cuneiform_src/Kern/cfcompat && $(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/cfcompat.dir/relink.txt --verbose=$(VERBOSE)
	cd /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir/cuneiform_src/Kern/cfcompat && $(CMAKE_COMMAND) -E cmake_symlink_library CMakeFiles/CMakeRelink.dir/libcfcompat.so.1.1.0 CMakeFiles/CMakeRelink.dir/libcfcompat.so.0 CMakeFiles/CMakeRelink.dir/libcfcompat.so

cuneiform_src/Kern/cfcompat/CMakeFiles/CMakeRelink.dir/libcfcompat.so.0: cuneiform_src/Kern/cfcompat/CMakeFiles/CMakeRelink.dir/libcfcompat.so.1.1.0

cuneiform_src/Kern/cfcompat/CMakeFiles/CMakeRelink.dir/libcfcompat.so: cuneiform_src/Kern/cfcompat/CMakeFiles/CMakeRelink.dir/libcfcompat.so.1.1.0

# Rule to relink during preinstall.
cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/preinstall: cuneiform_src/Kern/cfcompat/CMakeFiles/CMakeRelink.dir/libcfcompat.so
.PHONY : cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/preinstall

cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/requires: cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/cfcompat.c.o.requires
.PHONY : cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/requires

cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/clean:
	cd /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir/cuneiform_src/Kern/cfcompat && $(CMAKE_COMMAND) -P CMakeFiles/cfcompat.dir/cmake_clean.cmake
.PHONY : cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/clean

cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/depend:
	cd /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0 /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/cuneiform_src/Kern/cfcompat /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir/cuneiform_src/Kern/cfcompat /var/www/imater/data/www/4tree.ru/cuneiform-linux-1.1.0/builddir/cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : cuneiform_src/Kern/cfcompat/CMakeFiles/cfcompat.dir/depend

