library 'reference-pipeline'

pipeline {
	environment {
		EAI_NUMBER = "3536208"
		EAI_NAME = "app"
		EAI_PROJ = "IONIC"
		APP_VERSION = "1.6.4-RELEASE"
		L3URI = "https://lite-dev.ute.apac.fedex.com"
		L6URI = "https://lite-uat.dmz.apac.fedex.com"
	}

	agent {
		docker {
			label 'docker'           
			image 'nexus2.prod.cloud.fedex.com:8444/fdx/jenkins/headless-chrome-image'
		}
	}

	options {
		disableConcurrentBuilds()
		buildDiscarder(logRotator(numToKeepStr: '5'))
	}

	stages {
		stage ('NPM Setup') {
			steps {
				npmUtility(npmArgs: 'ci')
			}
		}
		
		stage('DEV Web Build') {
			when {
				expression {env.GIT_BRANCH == 'origin/dev'}
			}
			steps {
				npmUtility(npmArgs: 'run build:cd-dev')
			}
		}

		stage('PROD/UAT Web Build') {
			when {
				expression {env.GIT_BRANCH == 'origin/master'}
			}
			steps {
				npmUtility(npmArgs: 'run build:cd-uat')
			}
		}

		stage('Web Unit Test') {
			steps {
				npmUtility(npmArgs: 'run test')
			}
		}

		/*stage('Web E2E Test') {
			steps {
				npmUtility(npmArgs: 'run e2e')
			}
		}

		stage('Clean Up Previous Archives') {
			steps {
				sh 'rm -rf *.zip'
			}
		}

		stage('Publish XML/HTML') {
			steps {
				parallel (
					'PublishJunitXML' : {
						codeQuality junitPath: 'test-report/*.xml'
					},
					'PublishHTML' : {
						publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'src/coverage/', reportFiles: 'index.html', reportName: 'Coverage Report', reportTitles: ''])
						publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'test-report/', reportFiles: 'FSM-Lite-UTCR.html', reportName: 'UTCR Report', reportTitles: ''])
					}
				)
			}
		}

		stage('Archive Reports/Results') {
			steps {
				parallel (
					'ZipCoverageResults' : {
						zip archive: true, dir: 'src/coverage/', glob: '', zipFile: 'coverage.zip'
					},
					'ZipTestReports' : {
						zip archive: true, dir: 'test-report/', glob: '', zipFile: 'test-report.zip'
					}
				)
			}
		}

		stage ('SonarQube Permission') {
			steps {
				sonarQubePermissions projectkey: 'apac-ishipplus-3536208',  eai: '3536208'        
			}
		}*/
		
		stage('SonarQube Analysis & NexusIQ'){
			parallel {
				stage('SonarQube Analysis'){
					steps{
						sonarqube projectName: 'apac-ishipplus',
						projectKey: 'apac-ishipplus-3536208',
						projectVersion : '${APP_VERSION}',
						src: 'src',
						test: 'src',
						scmDisabled: 'true',
						binaries : '',
						repo: 'git',
						exclusions: "**/**.model.ts,**/**.module.ts",
						junitPath: '',
						jacocoPath: '',
						pythonXunitPath: '',
						pythonCoveragePath: '',
						profile: '',
						language: 'ts',
						tsCoveragePath: 'src/coverage/lcov.info'
				  	}
				}
		
				stage('NexusIQ'){
					when {
						expression {env.GIT_BRANCH == 'origin/master'}
					}
					steps{
						script{
							nexusIQAnalysis(iqAppName: 'APAC-LABELEX-3536208',
							iqApplication: 'APAC-LABELEX-3536208',
							iqScanPattern: '',
							exclusion: '',
							iqStage: 'build',
							failBuildOnNetworkError: 'false')
						}
					}
				}
			}
 		}
/*
		stage('Nexus Deploy'){
			when {
				expression {env.GIT_BRANCH == 'origin/master'}
			}
			steps{
				sh 'printenv'
				withCredentials([usernamePassword(credentialsId: 'NEXUS_ADMIN', 
					passwordVariable: 'NEXUS_PASSWORD', usernameVariable: 'NEXUS_USER')]) {
					sh 'npm -d publish'
				}
			}
		}
*/

 		stage('DAST - QualyWAS scan') { 
/*			when {
				expression {env.GIT_BRANCH == 'origin/master'}
			}*/
 		    steps{
 		        script{
                    qualysWASScan authRecord: 'none', 
                    cancelOptions: 'none', 
                    credsId: 'Qualys-CICD', 
                    optionProfile: 'useDefault', 
                    platform: 'US_PLATFORM_1', 
                    pollingInterval: '5', 
                    proxyPassword: '', 
                    proxyPort: 3128, 
                    proxyServer: 'internet.proxy.fedex.com', 
                    proxyUsername: '', 
                    scanName: '[job_name]_jenkins_build_[build_number]', 
                    scanType: 'VULNERABILITY', 
                    useProxy: true, 
                    vulnsTimeout: '60*24', 
                    webAppId: '495721841' 		        
                }
            }
 		}
 		
		stage('UDeploy Artifact Download - L3'){	
			when {
				expression {env.GIT_BRANCH == 'origin/dev'}
			}
			steps{
				script{
					nguDeploy(udeployCredentialsID: 'uDeploy_developer',
					uDeployAppName: 'APAC-LABELEX',
					componentName: 'APAC-LABELEX-WEB',
					baseDir: '/dist',
					processName: 'Deploy-LabelEx',
					uDeployLevel: 'L3',
					udeployInstance: 'Enterprise UrbanCode Instance 1',
					componentVersion: 'DEV.${BUILD_NUMBER}',
					includeFiles: '*.tar',
					excludeFiles: '',
					deployStrategy: 'false')
				}
			}
		}

		stage('UDeploy Artifact Download - L6'){	
			when {
				expression {env.GIT_BRANCH == 'origin/master'}
			}
			steps{
				script{
					nguDeploy(udeployCredentialsID: 'uDeploy_developer',
					uDeployAppName: 'APAC-LABELEX',
					componentName: 'APAC-LABELEX-WEB',
					baseDir: '/dist',
					processName: 'Deploy-LabelEx',
					uDeployLevel: 'L6',
					udeployInstance: 'Enterprise UrbanCode Instance 1',
					componentVersion: 'UAT.${BUILD_NUMBER}',
					includeFiles: '*.tar',
					excludeFiles: '',
					deployStrategy: 'false')
				}
			}
		}
	}

	post {
		success {
			emailext body: "Project IONIC has been deployed. <br /> If this is for L3, it can be accessed via ${L3URI}. <br /> If this is for L6, it can be accessed via ${L6URI}. <br /> <br /> Other build details can be found in the following:- <br /> Branch '${env.GIT_BRANCH}'<br /> Job '${env.JOB_NAME}' <br /> '[${env.BUILD_NUMBER}]' (${env.RUN_DISPLAY_URL})", 
				mimeType: 'text/html', 
				subject: "[SUCCESS] LABELEX - Continuous Delivery - IONIC - Build Deployed Successfully via '${env.GIT_BRANCH}'", 
				from: 'LabelEx-Jenkins-CD@corp.ds.fedex.com',
				to: 'LabelEx-Parasite@corp.ds.fedex.com'
		}
		failure {
			mail(to: 'LabelEx-Parasite@corp.ds.fedex.com', 
				from: 'LabelEx-Jenkins-CD@corp.ds.fedex.com',
				subject: "[FAILED] LABELEX - Continuous Delivery - IONIC - FAILED on ${env.GIT_BRANCH}",
				body: "Branch '${env.GIT_BRANCH}' Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.RUN_DISPLAY_URL})")
		}
	}
}
