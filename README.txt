Mustafa Caner Çalışkaner 21401961
İmge Gökalp 21402076

This program is based on figure example given in the book's example it is heavily modified and editted though. The main objective was to use the structure of the code to use it to show a 3D cat model (an obj file) and texture it to be realistic as possible. We were not able to animate the model, so the project only has a minecraft-like cat model.

Because of texture files when index.html file is opened cross-site protection kicks in and the index.html does not work on most of the   browser on the market. To run it you have to disable local file protection and(or) run a basic HTTP server.

Thus to run it on MacOS the following can be done:
1- Using terminal cd to directory of project and run "python -m SimpleHTTPServer 8080" command
2- Using the unsafe chrome instance you can go to 0.0.0.0:8080 to test the project.

Test on macOs using Chrome. Sadly it does not work on Windows unless uploaded to a server.

Tutorials used for importing model without any external lib: (failed to work but we should reference it)
https://www.youtube.com/watch?v=sM9n73-HiNA
https://www.youtube.com/watch?v=UWxp3FC2eNc
https://dannywoodz.wordpress.com/2014/12/16/webgl-from-scratch-loading-a-mesh/

Tutorials for importing and using textures:
https://www.youtube.com/watch?v=hpnd11doMgc&t=5s
https://webglfundamentals.org/webgl/lessons/webgl-3d-textures.html


Videos used as references to create the built-in animations:
https://www.youtube.com/watch?v=2hkUeuyCsJY
https://www.youtube.com/watch?v=gK40aqPw1iY
https://www.youtube.com/watch?v=IF5qlpI6syM