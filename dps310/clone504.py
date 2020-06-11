
#--------------------------------------------------------------------------------------------------
#										DA1458x Project Cloner									  #
#--------------------------------------------------------------------------------------------------
"""------------------------------------------------------------------------------------------------

	This python script generates a new DA1458x project by cloning the "empty_peripheral_template"
	sample application.

	This Python script must be placed in the "../projects/target_apps/template" folder of the SDK.  

	Individual steps are described in section 9.1 of the UM-B-050 user manual revision 1.1. Comments
	in this script refer to specific instructions of that document (example *** 9.1.4 ***)

	Use from a command shell: clone504 [<my-project-name>]
	or double-click clone504.py file in Windows Explorer
	
	Version 20160901-MH 

------------------------------------------------------------------------------------------------"""

import os, sys, shutil, time, subprocess

#--------------------------------------------------------------------------------------------------
# Returns the path of the current script appended with a forward-slash
#--------------------------------------------------------------------------------------------------
def getScriptPath():
    return os.path.dirname(os.path.realpath(sys.argv[0]))+"/"


#--------------------------------------------------------------------------------------------------
# Find the apps folder, the Keil project folder, the rwip folder, and app api folder.
#--------------------------------------------------------------------------------------------------
home = getScriptPath()


#--------------------------------------------------------------------------------------------------
# Derive new project name directly from command line argument or prompt user for input.
#--------------------------------------------------------------------------------------------------
if len(sys.argv) == 2:
	# Was name provided as command line argument?
	new_proj = sys.argv[1].lower()
else:
	# Prompt for user to input new project name.
	new_proj = input("Enter a new project name: ")
if len(new_proj) < 3:
	# Name too short. Report and exit.
	print("Project name must be more than 2 characters!")
	time.sleep(3)
	sys.exit();
if new_proj in os.listdir(home):
	# Name already exists. Report and exit.
	print("Project name already exists!")
	time.sleep(3)
	sys.exit();

	
#--------------------------------------------------------------------------------------------------
# Clone the template folder in the app_project folder *** 9.1.1 - 9.1.3 ***
#--------------------------------------------------------------------------------------------------
""" This works for integrated processor solution - can be expanded with external later """
shutil.copytree(home + "empty_peripheral_template", home + new_proj)



#--------------------------------------------------------------------------------------------------
# Rename project c and h files *** 9.1.4 - 9.1.5 ***
#--------------------------------------------------------------------------------------------------
root = home + new_proj
os.rename(root + "/src/user_empty_peripheral_template.h"	,root + "/src/user_" + new_proj + ".h")
os.rename(root + "/src/user_empty_peripheral_template.c"	,root + "/src/user_" + new_proj + ".c")
os.rename(root + "/Keil_5/empty_peripheral_template.uvoptx"	,root + "/Keil_5/" + new_proj + ".uvoptx")
os.rename(root + "/Keil_5/empty_peripheral_template.uvprojx",root + "/Keil_5/" + new_proj + ".uvprojx")


#--------------------------------------------------------------------------------------------------
# Modify project c file. *** 9.1.6 ***
#--------------------------------------------------------------------------------------------------
# Open the project c file and replace all occurrences of "empty_peripheral_template" with "<new_proj>"
with open(root + "/src/user_" + new_proj + ".c") as f:
    file_str = f.read()
file_str = file_str.replace("empty_peripheral_template", new_proj)
file_str = file_str.replace("Empty peripheral template",new_proj)
with open(root + "/src/user_" + new_proj + ".c", "w") as f:
    f.write(file_str)

# Open the project h file and replace all occurrences of "empty_peripheral_template" with "<new_proj>"
with open(root + "/src/user_" + new_proj + ".h") as f:
    file_str = f.read()
file_str = file_str.replace("empty_peripheral_template", new_proj)
file_str = file_str.replace("Empty peripheral template",new_proj)
with open(root + "/src/user_" + new_proj + ".h", "w") as f:
    f.write(file_str)

#--------------------------------------------------------------------------------------------------
# Modify project callback config h file. *** 9.1.7 ***
#--------------------------------------------------------------------------------------------------	
# Open the callback config h file and replace all occurrences of "empty_peripheral_template" with "<new_proj>"
with open(root + "/src/config/user_callback_config.h") as f:
    file_str = f.read()
file_str = file_str.replace("empty_peripheral_template", new_proj)
with open(root + "/src/config/user_callback_config.h", "w") as f:
    f.write(file_str)

#--------------------------------------------------------------------------------------------------
# Modify project h file. *** 9.1.8 ***
#--------------------------------------------------------------------------------------------------	
# Open the callback config h file and replace all occurrences of "EMPTY_PERIPHERAL_TEMPLATE" with "<new_proj>"
with open(root + "/src/user_" + new_proj + ".h") as f:
    file_str = f.read()
file_str = file_str.replace("EMPTY_PERIPHERAL_TEMPLATE", new_proj.upper())
with open(root + "/src/user_" + new_proj + ".h", "w") as f:
    f.write(file_str)

#--------------------------------------------------------------------------------------------------
# Modify Keil uVision files. *** 9.1.9 - 9.1.12 ***
#--------------------------------------------------------------------------------------------------	
# Open the Keil5 project files and replace all occurrences of "empty_peripheral_template" with "<new_proj>"
with open(root + "/Keil_5/" + new_proj + ".uvprojx") as f:
    file_str = f.read()
file_str = file_str.replace("empty_peripheral_template", new_proj)
with open(root + "/Keil_5/" + new_proj + ".uvprojx", "w") as f:
    f.write(file_str)

with open(root + "/Keil_5/" + new_proj + ".uvoptx") as f:
    file_str = f.read()
file_str = file_str.replace("empty_peripheral_template", new_proj)
with open(root + "/Keil_5/" + new_proj + ".uvoptx", "w") as f:
    f.write(file_str)

#--------------------------------------------------------------------------------------------------
# End of Process
#--------------------------------------------------------------------------------------------------
print("Project \"" + new_proj + "\" created. Opening folder...")
time.sleep(1)
print("Done!")
# Open the new project folder
os.startfile(root)
