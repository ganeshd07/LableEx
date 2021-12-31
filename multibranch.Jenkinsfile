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
		
		stage('Web Build') {
			when { not { anyOf { branch 'master'; branch 'dev' } } }
			steps {
				npmUtility(npmArgs: 'run build:aot')
			}
		}

		stage('Web Unit Test') {
			steps {
				npmUtility(npmArgs: 'run test')
			}
		}
	}
	
	post {
		failure {
			mail(to: 'LabelEx-Parasite@corp.ds.fedex.com', subject: "Multibranch pipeline FAILED on ${env.GIT_BRANCH} by ${env.CHANGE_AUTHOR}",
				body: "'${env.CHANGE_AUTHOR}' Branch '${env.GIT_BRANCH}' Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.RUN_DISPLAY_URL})")
		}
	}
}