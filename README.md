# Object familiar size informs distance perception in briefly presented scenes

#### OSF Pre-Registration: 

125ms - https://osf.io/u79qe

250ms - https://osf.io/2uqz7

1000ms - https://osf.io/hpwv8


## Project Abstract
Visual spatial perception depends on integrating multiple sources of information over time, including distance cues extracted from the scene (e.g., linear perspective, ground plane) and semantic cues such as object familiar size. Compared to other spatial cues in complex natural scenes, object familiar size information is omnipresent and can provide information about absolute distance. Here, we test to what extent object familiarity drives performance at brief viewing durations (125, 250, and 1000 ms) by presenting objects in three scale conditions: (1) the object appears smaller than expected (0.75x), (2) the object appears in its expected size (1x), and (3) the object appears larger than expected (1.3x). Participants judged target distances to 54 unique objects in diverse naturalistic rendered scenes. Target objects were either presented as familiar (e.g., laptop, basketball) or unfamiliar objects (cuboid matched in size and orientation to the corresponding familiar object) to distinguish the effect of object familiar size independently from the effect of object angular size. The importance of object familiar size for metric estimates of distance was observed in just 125 ms. Changes in the scale of familiar objects introduced a significant bias to distance judgments (larger objects were judged as closer, and smaller objects were judged as further away when distance was kept constant). When objects were presented as unrecognizable cuboids this effect was significantly reduced, indicating that egocentric distance judgments are powerfully shaped by semantic expectations for familiar object size. The speed of this effect suggests a rapid, optimized mechanism that integrates object and spatial information to inform spatial perception. 
 

## Experiment
In the current study, we systematically manipulated object familiar size to examine it's influence on numerical estimates of egocentric distance in naturalistic rendered scenes (e.g., How far away was the target?). Target objects from a variety of different categories were presented in three retinal size conditions: (1) 0.75x, where the object appears 33.33% smaller than its expected size, (2) 1x, where the object appears in its expected size, and (3) 1.3x, where the object appears 33.33% larger than its expected size (Figure 1A). Based on the empiricist account of distance perception, it is predicted that deviations from the expected familiar size of objects would bias distance judgments within it. Thus, if objects in the scene were larger than typical for their category (i.e., 1.3x scale condition) that would lead to shorter distance estimates and vice versa for abnormally small objects (i.e., 0.75x scale condition). In contrast, if object familiarity was removed, other object-centric distance cues (i.e., angular size) may instead bias estimates. The angular size of these ‘cuboid’ objects across trials for example may indicate depth. Objects that appear smaller are judged to be further away, whereas objects that appear larger are judged to be nearer to the observer. To test this each of the objects, rendered at three scales, were either presented naturally as familiar objects (e.g., laptop, soccer ball, milk carton) or as unfamiliar object cuboids that are matched in retinal image size. Specifically, the bounding box for each object was rendered in Unity at the exact location and orientation of the original object, maintaining the retinal image size and scale of the corresponding object. This was made possible by detailed 3D data, tight feature control, and image diversity afforded by virtual reality environments available on Unity (VR gaming platform). 


## What does this repository contain?

1. Analysis  
2. Counterbalancing
3. Data
4. Frontend Experiment Code
5. Stimulus Prep


### Analysis 
Scripts for data analysis. 

### Counterbalancing
The main goal of this project was to determine how stimulus-specific variations in object familiarity and object scale drive spatial perception. Therefore, it was critical for stimulus order, hysteresis effects, object familiarity/scale, and duration to be carefully balanced. Each scene image was rendered with the target object at three different visual sizes. The scale of target objects across scenes (0.75x, 1x, 1.3x) was manipulated within subjects such that participants see an equal number of each size condition for both familiar and unfamiliar objects. The six object scale by familiarity images per scene (three scale conditions presented either as familiar or unfamiliar objects) however were presented between subjects so there is no image repetition within participants. The targets (N=54) ranged in distance between 1 and 5 meters. Individual participants saw a different scene image order determined by a latin square such that each of the 54 images occured in each trial number equally often across 54 stimulus sequences.
See our OSF Pre-Registration for a more detailed explanation (https://osf.io/u79qe).


### Frontend Experiment Code
All participants were recruited via Prolific (online data collection platform), presented with an IRB compliant comprehensive consent form, and paid for their efforts according to the time each task took. This folder contains all frontend code necessary to collect data. Participants completed the experiment online via a link to a Heroku server that selected a unique trial sequence (see Counterbalancing) that automatically directed participants to the experiment hosted on an Amazon Web Service (AWS) server. An Apache server was used to run the experiment, and needs to be configured to allow for CORS in order for the web content to load. A copy of the Amazon Machine Image (AMI) created to host this experiment can be used for easy replication (provided upon request). 

- The main files for running the experiment are [exp-name]_CSS.css, [exp-name]_JS.js, and [exp-name]_HTML.html 
- The data is logged and saved as a CSV on the server in saveFile.php
- Participants receive an unique completion code via revealCode.html
- /frontend_experiment_code/batch_variables/MX_variables.csv: contains the variables (i.e., links) uploaded to the Heroku server (randomly distributed without repetition to participants) 

Unique, counterbalanced trial sequences were generated. The following files allow for a balanced design in terms of images, duration, object familiarity, and object scale. 
- /frontend_experiment_code/jsons contains the unique trial structures for each duration - one for each participant. Each json file contains the duration, image path, and mask image path for each trial, for a total of 54 trials.
Participants were given a few practice trials to acclimate themselves to the experiment. The file practice_data.json reflects the trial structure for these trials.
- Colored masks (unique mask per trial)
- counterbalancing.csv is a file that is referenced in [exp-name]_JS.js to select the correct trial sequence (JSON file) for a given task

### Stimulus Prep
Contains the script for rendering the red target atop the target object in the scene, along the vertical midline of the image. The image path contains the exact pixel coordinate at which the target should be placed for each image. 

## Contact:
If you are interested in learning more about our work or have any questions feel free to contact us! 

Prachi Mahableshwarkar: prachi.sm11@gmail.com, pmahable@gwu.edu

Dwight Kravitz: kravitz@gwu.edu

John Philbeck: philbeck@gwu.edu
