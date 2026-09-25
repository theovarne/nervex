# WEB–SOMA morphology sources

## Spider body

“AGELENIDAE - FUNNEL WEAVERS” by Lynnie.T (`sp-id-er`), published on Sketchfab under CC BY 4.0.

- Model: https://sketchfab.com/3d-models/agelenidae-funnel-weavers-1fbc223eb2df477687868565fa592249
- Archive access: Objaverse 1.0, Allen Institute for AI
- Original geometry: 3,853,488 triangles
- Web derivative: spatially welded and reduced to 139,999 triangles, then compressed with Meshopt

## Central nervous system

Synapsin channel from the three-dimensional immunofluorescence atlas of the brain of the hackled-orb weaver spider *Uloborus diversus*.

- Article: Artiushin, Corver, Gordus et al., eLife 2026, DOI 10.7554/eLife.107732.3
- Volume archive: Brain Image Library, `ace-owl-gum`, DOI 10.35077/ace-owl-gum
- License: CC BY 4.0
- Web derivative: scale-3 Synapsin volume, Gaussian smoothing, Otsu thresholding, small-component filtering, binary closing, marching-cubes surface extraction, simplified to 77,954 triangles with a 0.1% mesh-radius error ceiling, then compressed with Meshopt

## Scope note

The body and CNS come from different spider taxa and are presented as a transparent comparative visualization, not as a reconstruction of one specimen. Leg pathways, spinneret bridge, market nodes, thread tension, signal propagation, and web vibration are NERVEX computational interpretations.

## Rig hierarchy reference

The optional research-only RIG layer borrows the eight-leg and multi-joint hierarchy concept from SpiderBot_DeepRL. No robot surface mesh is used in the final biological visualization.

- Repository: https://github.com/arijit-dasgupta/SpiderBot_DeepRL
- License: Apache-2.0

## Web physics reference

The browser implementation uses an original compact 3D Verlet particle/constraint solver informed by the architecture and spiderweb example of verlet-js.

- Repository: https://github.com/subprotocol/verlet-js
- License: MIT
