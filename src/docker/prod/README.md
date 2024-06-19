Docker Production config does not work reliably with auth.js v5 beta. Should probably wait for more stable version.

Open CMD.exe (not VSCode > Terminal)
Changfe directory to the root of this project to and run the following commands from the root:

- docker build --no-cache -t hr-org-chart-nextjs-14-prod . -f docker/prod/Dockerfile
- docker run -d -p 3000:3000 --name hr-org-chart-nextjs-14-prod hr-org-chart-nextjs-14-prod
- docker stop hr-org-chart-nextjs-14-prod
- docker rm hr-org-chart-nextjs-14-prod

# How to move docker files to another drive on WIndows (like D: instead of C:)

- https://stackoverflow.com/questions/62441307/how-can-i-change-the-location-of-docker-images-when-using-docker-desktop-on-wsl2/63752264#63752264
