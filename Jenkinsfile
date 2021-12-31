library 'reference-pipeline'

pipeline {
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
				npmUtility(npmArgs: 'run build')
			}
		}

		stage('PROD Web Build') {
			when {
				expression {env.GIT_BRANCH == 'origin/master'}
			}
			steps {
				npmUtility(npmArgs: 'run build:prod')
			}
		}

		stage('Web Unit Test') {
			steps {
				npmUtility(npmArgs: 'run test')
			}
		}

		/*stage('Web E2E Test') {
			steps {
				npmUtility(npmArgs: 'run e2e')
			}
		}*/

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

		/*stage('Sonar Scanner') {
			steps {
				npmUtility(npmArgs: 'run sonar')
			}
		}*/

		/*stage ('SonarQube Permission') {
			steps {
				sonarQubePermissions projectkey: 'apac-ishipplus-3536208',  eai: '3536208'        
			}
		}*/
		
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
	}
}
