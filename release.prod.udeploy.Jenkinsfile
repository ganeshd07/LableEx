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
		stage('Force Clean Up'){
			steps{
				sh 'ls -lrt'
				sh 'rm -rf dist/'
				sh 'rm -rf *.tgz'
			}
		}
		
		stage('Nexus Version Select'){
			steps{
				script{	
                    ngNexusVerSelector(nexusCredentials: 'NEXUS_ADMIN',
                    repositoryName: 'npm-release',
                    groupName: 'eai3536208',
                    artifactName: 'apac-labelex')
		        }
			}
		}

		stage('Nexus Artifact Download'){
			steps{
				script{	
                    ngNexusDownload(nexusCredentials: 'NEXUS_ADMIN',
                    repositoryName: 'npm-release',
                    groupName: 'eai3536208',
                    artifactName: 'apac-labelex')
		        }
			}
		}

		stage('Create uDeploy Artifact'){
			steps{
				sh 'ls dist/'
				sh "rm -f dist/*.tar && tar -czvf apac-labelex-${APP_VERSION}-${currentBuild.startTimeInMillis}.tar dist/* && mv apac-labelex-${APP_VERSION}-${currentBuild.startTimeInMillis}.tar dist && ls -l dist/"
			}
		}

		stage('UDeploy Artifact Download - LP'){	
			steps{
				script{
					nguDeploy(udeployCredentialsID: 'uDeploy_developer',
					uDeployAppName: 'APAC-LABELEX',
					componentName: 'APAC-LABELEX-WEB',
					baseDir: '/dist',
					processName: 'Deploy-LabelEx',
					uDeployLevel: 'LP',
					udeployInstance: 'Enterprise UrbanCode Instance 1',
					componentVersion: 'PROD.IONIC.RELEASE.${BUILD_NUMBER}',
					includeFiles: '*.tar',
					excludeFiles: '',
					deployStrategy: 'false')
				}
			}
		}
	}

	post {
		success {
			emailext body: "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\"><html xmlns=\"http://www.w3.org/1999/xhtml\"><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"></head><body><p><strong><h1 style=\"background-color:Tomato\"> ATTENTION! </h1></strong> Project ${EAI_PROJ}-${APP_VERSION} has been uploaded to uDeploy pending release admin for Production approval. Once approved by release admin, it will be deployed to production immediately. <br /> This also implies all necessary IT compliances have already been captured and PMT approval has been obtained. <br />If this is NOT intended, please contact release admin, IT lead and SE to reject this deployment and to revoke to compliant release version. </p><p><strong>Application:</strong>&nbsp;apac-labelex</p><p><strong>Branch:</strong>&nbsp;${env.GIT_BRANCH}</p><p><strong>Build number:</strong>&nbsp;${env.BUILD_NUMBER}</p><p><strong>Result:</strong>&nbsp;SUCCESS</p><p><strong>Link:</strong>&nbsp;<a href=\"${env.BUILD_URL}\">${env.BUILD_URL}</a></body></html>", 
				mimeType: 'text/html', 
				subject: "[SUCCESS][PROD] '${EAI_PROJ}' - Continuous Delivery - Build uploaded to uDeploy for Production Deployment", 
				from: 'LabelEx-Jenkins-PROD-CD@corp.ds.fedex.com',
				to: 'LabelEx@corp.ds.fedex.com'
		}
		failure {
			mail(to: 'LabelEx-Parasite@corp.ds.fedex.com', 
				from: 'LabelEx-Jenkins-PROD-CD@corp.ds.fedex.com',
				subject: "[FAILED][PROD] '${EAI_PROJ}' - Continuous Delivery - Build upload failed to uDeploy via '${env.GIT_BRANCH}'",
				body: "Branch '${env.GIT_BRANCH}' Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.RUN_DISPLAY_URL})")
		}
	}
}
