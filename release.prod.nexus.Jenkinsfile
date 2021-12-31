library 'reference-pipeline'

pipeline {
	environment {
		EAI_NUMBER = "3536208"
		EAI_NAME = "app"
		EAI_PROJ = "IONIC"
		APP_VERSION = "1.6.4-RELEASE"
		L3URI = "https://lite-dev.ute.apac.fedex.com"
		L6URI = "https://lite-uat.dmz.apac.fedex.com"
        LPURI = "https://lite.dmz.apac.fedex.com"
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

		stage('PROD Web Build') {
			steps {
				npmUtility(npmArgs: 'run build:cd-prod')
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
		}*/

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

		/*stage ('SonarQube Permission') {
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

		stage('Nexus Deploy'){
			steps{
				sh 'printenv'
				withNPM(npmrcConfig:"c3d40cd2-0e46-42f8-ba8d-a0e54f6adacb"){
					script{				
						ngNexusUpload(repositoryName: 'npm-release',
						groupName: 'eai3536208',
						artifactName: 'apac-labelex')
					}
				}
			}
		}
	}

	post {
		success {
			emailext body: "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\"><html xmlns=\"http://www.w3.org/1999/xhtml\"><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"></head><body><p>Project ${EAI_PROJ}-${APP_VERSION} has been uploaded to Nexus and it is ready for further action. If this is not intended, please review Jenkins access to only allow authorized publishing. Only release admin / IT lead shall be permitted publishing to Nexus release repository. </p><p><strong>Application:</strong>&nbsp;apac-labelex</p><p><strong>Branch:</strong>&nbsp;${env.GIT_BRANCH}</p><p><strong>Build number:</strong>&nbsp;${env.BUILD_NUMBER}</p><p><strong>Result:</strong>&nbsp;SUCCESS</p><p><strong>Link:</strong>&nbsp;<a href=\"${env.BUILD_URL}\">${env.BUILD_URL}</a></body></html>", 
				mimeType: 'text/html', 
				subject: "[SUCCESS][PROD] '${EAI_PROJ}' - Continuous Delivery - Build uploaded successfully to Nexus via '${env.GIT_BRANCH}'", 
				from: 'LabelEx-Jenkins-PROD-CD@corp.ds.fedex.com',
				to: 'LabelEx-Parasite@corp.ds.fedex.com'
		}
		failure {
			mail(to: 'LabelEx-Parasite@corp.ds.fedex.com', 
				from: 'LabelEx-Jenkins-PROD-CD@corp.ds.fedex.com',
				subject: "[FAILED][PROD] '${EAI_PROJ}' - Continuous Delivery - Build upload failed to Nexus via '${env.GIT_BRANCH}'",
				body: "Branch '${env.GIT_BRANCH}' Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.RUN_DISPLAY_URL})")
		}
	}
}
