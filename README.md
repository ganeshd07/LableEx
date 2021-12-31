# LABELEX CODE CONVENTION
This document serves as a reference or guide about some rules or recommendations which the team considers to be the best practices during the ***development*** or ***code review*** process for ***maintaining clean and readable codes***.

> Why is this so important? ..Because we read code way more than we write. It's crucial that we simplify this task as much as possible, most especially for our fellow teammates. 
	
## CONVENTION #1: *ANGULAR CLI COMMANDS*

It's always a good practice to make use of available Angular/Ionic commands when generating a feature, pages, components, enums, services, etc. or running and/or building deployment artifacts. These commands automatically generates relevant files.

Here are some of the basic commands to get started:

 - ***To generate a  feature/type*** (refer to list of type after example):
   `ionic generate <type> <folders_inside_src/app/>/<file_name>`
   *for example*:
    `ionic generate page pages/home`
	**type**: 
	 - *page*  
	 - *class*
	 - *component* 
	 - *directive* 
	 - *enum*  
	 - *service*
	 - *interface*

> ***To generate a model***, use the type ***class***. It can generate a model class successfully but without the file type. Manually edit the file name to add a file type, *dot separated*. 
>> *for example:*
	>> From ***sender-details.ts*** (*generated file*) to ***sender-details.model.ts*** (*manually edited file name with a file type*) for compliance to *CONVENTION #2*

 - **To run the application locally via Port 8080:**
 `npm run local` 
 
 - **To build deployment scripts based on environment settings:**

>  ***For dev/local***
>  `npm build`
>  ***For staging/UAT***
>  `npm build:uat`
>  ***For production***
>  `npm build:prod`

- **To run a test with code coverage statistics:**
`npm test`

> ***Developers are encouraged to create more custom commands specially if it would benefit to increasing one's productivity. ***

--------------------
## CONVENTION #2: *GENERAL NAMING GUIDELINES*

### ***FOLDER NAMING***

Naming conventions are important to maintainability and readability. *Here are some pointers to consider when naming folders or directories*:

>  1) Folder or directory name must be kept short but descriptive enough to identify its content.  
>  2) If folder or directory has two or more descriptive names, use a **dash (-)** to separate the words.  
>  `e.g.mock-datatypes` 
>  3)  *Limit up to 2 descriptive names/words ONLY* for non-feature or category folder/directory.

### ***FILE NAMING***

This convention supports the manual creation of files like model and other type not listed under *CONVENTION #1*.

> When creating files, developers should pay attention to the file names. Names should be consistent with the [Angular coding style](https://angular.io/guide/styleguide). 

The file name pattern should consists of ***file feature's name*** first then followed by the ***file type***, ***dot(.) separated***. For example:

    <feature_name>.<type>.<extension_type> -> home.service.ts
    
 If the feature has two or more descriptive names, the files should use a **dash(-)** to separate the words in the name, for example:
 
    package-and-billing-options.service.ts

The file name should be limited up to **255 characters ONLY** to prevent any OS file name errors.

> "Do name a file or folder such that you instantly know what it contains and represents."

### ***CLASS NAMES***
 
The class name should match the name of the file but by using ***upper camel case style*** with additional suffix which represents the ***file type***, as shown below:  

> export class HomeService 
> export class Home Component
> export class ReplacementPipeDirective
> 

With the *exception of **models**, **enums** and **interfaces***

### ***VARIABLE AND FUNCTION NAMES***

Consider naming the variables and functions that other developers can easily understand at a glance.  Be descriptive and use meaningful names --  ***clarity over brevity.***

- Use ***noun*** or ***adjective***  word for variables.
- Use ***verb*** word for functions.
- Use ***camel case style*** for both.
``` 
e.g. 
let userType, 
let currencyCode, 
public getCurrentUser(){ ... }
```

--------------------
## CONVENTION #3: *OVERALL STRUCTURAL GUIDELINES*

> Do structure the app such that you can ***Locate*** code quickly,  ***Identify*** the code at a glance, keep the ***Flattest*** structure as much as you can, and try to be ***DRY*** (***Dont Repeat Yourself***).

 ***List to consider before creating a new file or folder:***
 
 - Consider thoroughly checking file or directory duplicates. (*see **Current Folder Structure** for list of existing project folders*). 
- If the file or folder exists and conflicting purpose emerged, please communicate to the team immediately for mutual resolution. 
- Consider creating sub-folders when a folder reaches ***eight (8) or more files***. 
- Refer to folder structure below to determine file group.

`NOTE: If a new file and/or folder has been created, please update folder structure below before committing the changes.`

**CURRENT FOLDER STRUCTURE:**
```
apac-ishipplus (project directory name)
│   README.md
│   LABELEX_CODE_CONVENTION.md    
│	Jenkinsfile
│	... other angular config files..
└───[-] src
│   └───[-] app 
│   │   └───[-] interfaces
│   │	│	└───[+] mock-data 
│   │	│	... Other ungrouped interface files..	
│   │   └───[-] models 
│   │	│	└───[-] apim 
│   │   │	│	└───[+] availability
│   │   │	│	└───[+] commodity
│   │   │	│	└───[+] country
│   │   │	│	└───[+] globalTrade
│   │   │	│	└───[+] notification
│   │   │	│	└───[+] payment
│   │   │	│	└───[+] rate
│   │   │	│	└───[+] shipment
│   │   │	│	└───[+] user
│   │   │	│	... Other ungrouped apim model classes..
│   │	│	└───[-] local
│   │   │	│	└───[+] address
│   │   │	│	└───[+] commodity
│   │   └───[-] pages 
│   │	│	└───[-] account
│   │   │	│	└───[+] get-rate-quote
│   │   │	│	└───[+] login
│   │   │	│	└───[+] otp-login
│   │   │	│	└───[+] sso-login
│   │   │	│	... account related modules & components
│   │	│	└───[-] navigation-menu
│   │   │	│	└───[+] about
│   │   │	│	└───[+] home
│   │   │	│	└───[+] splash
│   │	│	└───[-] modal
│   │   │	│	└───[+] notification
│   │   │	│	└───[+] alert
│   │	│	└───[-] shipping
│   │   │	│	└───[+] billing-and-options
│   │   │	│	└───[+] commodity-details
│   │   │	│	└───[+] create-new-recipient
│   │   │	│	└───[+] customs-detail
│   │   │	│	└───[+] label-page
│   │   │	│	└───[+] recently-shipped
│   │   │	│	└───[+] recipient
│   │   │	│	└───[+] recipient-contact-details
│   │   │	│	└───[+] sender
│   │   │	│	└───[+] shipment-detail
│   │   │	│	└───[+] shipping-workflow
│   │   │	│	└───[+] terms-and-conditions
│   │   └───[-] providers
│   │	│	└───[+] apim
│   │	│	└───[+] directives
│   │	│	└───[+] local
│   │	│	└───[+] mapper
│   │	│	└───[+] p4e
│   │	│	... Other ungrouped provider classes or services..
│   │   └───[-] types
│   │	│	└───[+] enum
│   │	│	└───[+] constants
│   │	│	... Other ungrouped type classes
│   │   ... root component related files..   
│   └───[-] assets
│   │   └───[+] config
│   │   └───[+] data 
│   │   └───[+] fonts
│   │   └───[+] i18n
│   │   └───[+] img
│   └───[+] environments 
│   └───[+] theme
│   |	index.html
│   │	karma.conf
│   │	... more angular related files
```
--------------------
## CONVENTION #4: ***COMMENTS***

Comments are must-have for classes that bears the business logic like ***services*** and ***directives***.  

> If you are considering putting a comment to a class, consider adding authorship info too , see *format* below (*so developers would know who to approach for questions*):
```
/**
 * <class brief description or purpose here>
 *
 * Author: <author_name>
 * Date Created: <current_date> 
 */
export class MockShipmentService {
...
```
Consider placing comments for any of the following:

 - [ ] When you need to explain "why" did you do that.
 - [ ] When you need to explain consequences.
 - [ ] For API Docs

> ***"Comments must be readable and maintained."***

--------------------
## CONVENTION #5: ***CODING GUIDELINES***

*Here's a list to keep in mind while coding & code reviewing:*

 - ***Keep the function small and clean. Consider breaking down or refactoring if more than 10 lines.***
 -  ***Put presentation logic in component class***
 -  ***Delegate complex/business logic to services***.
 -  ***Properties declaration first before methods.***
 -  ***Public members first before private members, and must be in alphabetical order.***
 -   ***Follow component properties sequence below:***
 ```
	1) @ViewChild() properties (if any)
	2) @Input() properties (if any)
	3) @Output()properties (if any)
	4) boolean properties
	5) constants/string properties
	6) numeric properties
	7) array properties
	8) all other properties...

	NOTE: The sequence above comes first before the constructor
 ```
 -  ***Use attribute directives for presentation logic without a template.***
 -  ***Always removed unused code(s) or place a comment/description to retain***.
 -  ***Single Principle Responsibility -- a single class or module should only have a single responsibility.***
 -  ***Avoid having multiple functions with the same purpose. Create a common /shared class as necessary.***
 -  ***Avoid cluttering of imports or dependencies in app.module.ts (Observe proper lazy loading of modules).***
 -  ***Avoid allowing modules in sibling and parent folders to directly import a module in a lazy loaded feature.***
 -  ***Create a separate data mapper class for mapping API call responses.***
 -  ***Always aim for reusability or look for reusable codes before writing a new one as much as possible.***

> Check out this [link]([https://www.freecodecamp.org/news/best-practices-for-a-clean-and-performant-angular-application-288e7b39eb6f/](https://www.freecodecamp.org/news/best-practices-for-a-clean-and-performant-angular-application-288e7b39eb6f/)) for some useful coding practice hacks.   

--------------------
## CONVENTION #6: ***CODE REVIEW PRACTICES***

*Here's a checklist you can follow before submitting code review request:*

 - [ ] 1) Make sure you got the latest version from [gitlab]([https://gitlab.prod.fedex.com/](https://gitlab.prod.fedex.com/)) ***dev*** branch.
 - [ ] 2) Make sure all conflicts (if there's any) has been resolved before submitting a merge request.
 - [ ] 3) Make sure to run unit test with 0 failure and ***don't forget to capture the result***.
 - [ ] 4) When you're ready, submit a merge request to ***dev*** branch via [gitlab]([https://gitlab.prod.fedex.com/](https://gitlab.prod.fedex.com/)), make sure to attach the screenshot of unit test result and supply the following:

> ***Title***: Merge <***local_branch_name***> to dev branch
> ***Description***: 
> 	<***user_story_number***>: <***user_story_title***>
> <***bulleted_list_of_changes***> 
 - [ ] Notify the team for a code review session.

> ***Do you have some other recommendations? Please feel free to edit this file!*** 
"# LableEx" 
