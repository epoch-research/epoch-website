---
title: Research
---

<head>
	<style>
		.project-list {
      		overflow: hidden;
    	}
		.project {
			vertical-align: top;
			color: #111;
     		height: 100%;
      		border-bottom: 1 solid grey;
		}
		.project h3 {
			margin-bottom: 0px;
		}
		.project p {
			color: grey;
		}
		.project-date {
			float: left;
			width: 10%;
			margin-top: 7px;
			margin-right: 1em;
		}
		.project-summary {
			float: left;
			width: 50%;
		}
		.project-thumbnail {
			float: right;
			width: 30%;
		}
		.project-thumbnail img {
			max-width: 100%;
		}
	</style>
</head>

# Epoch: Research Agenda (Draft)
By Anson Ho 
Last update: 12 April 2022

This is a formal research agenda for the Machine Learning Progress research group. An informal writeup for an audience familiar with EA can be found here [to be linked to].

1 Introduction
1.1 Measuring and monitoring AI development
The development of Artificial Intelligence (AI) has been progressing at a rapid rate - since 2010, there has been a 10 billion-fold increase in the compute used to train Machine Learning (ML) systems (Sevilla et al., 2022). Countries are developing national AI strategies one after another, such as the 2017 Pan-Canadian Artificial Intelligence Strategy (CIFAR, 2020), and China’s New Generation Artificial Intelligence Development Plan (Webster, 2017). AI systems are being deployed across a wide plethora of domains, ranging from social media (Kreps, 2020) to protein folding (Senior, 2020).

Given these developments, it is imperative that researchers and governments alike pay close attention to the possible risks from AI, such as misuse of AI by malicious actors and algorithmic bias (Dafoe, 2018). We at the ML Progress research group are particularly interested in risks from transformative AI (TAI) – an AI system that has the potential to have an effect on society as large as that of the industrial revolution (Karnofsky, 2016).

There are several reasons for our concern about TAI in particular:
TAI could be highly dual-use: AI systems can be used for peaceful and harmful purposes (Dafoe, 2018), and the leverage that TAI offers could be strongly amplified with more powerful, future AI systems. While we want to maximise the potential benefits of TAI (e.g. for healthcare), we need to ensure that these systems are not misused, for example:
Increasing the stability of authoritarian regimes due to mass surveillance
Development of dangerous chemical weapons using AI systems, which if deployed could offer a strategic advantage that increases other risks (e.g. nuclear war)
Thus it is necessary to be cautious, and the first step of this is to closely monitor AI developments, especially those that bring us closer to TAI. 
TAI would be a general-purpose technology: By definition, a TAI would be something that has a huge effect on society (e.g. through the economy). We need to ensure that society transitions to a world with TAI in controlled fashion, and be prepared for the possibility of major labour demand shocks due to loss of jobs, as well as political instability (Garfinkel, 2021). This entails being aware of the abilities of AI systems, both at present, and what we should expect in the future. 
Existing models suggest that TAI may not be very far away: For instance, Cotra (2020) estimates a probability of around 80% for the development of TAI by this century. These findings are supported by our recent investigation into compute trends (Besiroglu et al., 2022). Meanwhile, Davidson (2021) estimates a probability of 20% of the development of artificial general intelligence (AGI) in the same timeframe, which is a higher bar than TAI. At minimum, these models strongly suggest that the possibility of TAI within this century needs to be taken seriously.
Accident risks: An especially salient problem in AI safety is the problem of ensuring that AI systems robustly and accurately pursue human values; the AI alignment problem (Amodei, 2016; Christian, 2021). A transformative AI system that is deployed by actors with insufficient awareness of the risks, or without going through certain kinds of standardised tests, could be extremely harmful. We can thus monitor current procedures, to ensure that actors are not cutting corners on safety protocols as AI systems are being developed and deployed. Preventing accident risks due to the misalignment of AI systems is a central focus of the field of technical AI safety.

A major challenge for the successful governance of AI is that policy tends to lag behind technical progress, and this is especially true in the case of AI (Whittlestone, 2021). Given the highly dual-use nature of AI and the possibility of precipitating risks on a global scale (Dafoe, 2018), this challenge is highly problematic. 

Whittlestone and Clark (2021) point out that this lag between policy and AI development is not a necessary state of affairs, and that effective measurement and monitoring of AI is critical for helping decision makers. Doing this helps governments develop better approaches to assessing the impacts of AI, prioritise areas of policy and research focus, as well as prepare society for future AI challenges. 
1.2 Overview of our research agenda
Our focus at ML Progress is strongly motivated towards helping institutions make more informed decisions about AI, and ensuring the development of safe and beneficial AI systems more broadly. As such, we help monitor progress in AI development, working closely with both technical researchers, philanthropic funders, and government policymakers. In addition, we hope to serve as a bridge at one of the many intersections between technical AI safety and AI governance researchers. 
 
Our work consists of two main research directions:
Monitoring the inputs of ML models
We identify two main classes of inputs:
First-order inputs: directly influence the development ML models, e.g. compute, algorithms, and data
Second-order inputs: lie upstream of first-order inputs and indirectly influence the development of ML models, e.g. money, skill, and talent 
Monitoring the outputs of ML models
E.g. observing the changes in performance of Computer Vision models on ImageNet, relative to changes in compute

We believe that these two lines of research help answer key questions about AI development and bring about positive change in the following ways:
Tackling foundational questions: investigating questions that are central to understanding the development of AI, e.g. comparing the relative importance of data and compute in improving ML system performance. This can help inform future governance strategies.
AI forecasting: improving our understanding of the future AI landscape, e.g. the forecasted performance of the winning AI system on ILSVRC 2025. Certain forecasts can be highly informative of what preparatory actions governments should take to prepare for the impacts of AI, particularly in the case of TAI.
Supporting effective AI strategy: helping governments make more informed decisions using metrics and data, e.g. applying regulations so that only approved actors are allowed access to large amounts of training compute. Policymakers often lack the time to develop intuitions about technologies – providing measures of progress can be especially useful in such situations.
Improving awareness: increasing awareness of the importance of monitoring AI progress, e.g. by running competitions to build plugins to measure compute used to train a ML model. This helps make the monitoring of AI progress easier going forward.

The following sections go into more detail about our work and theory of change.
2 Our work
Currently, our primary interest is to measure the inputs and outputs of ML systems, in order to gauge AI progress. We first focus on the inputs, and later work may expand on this. In particular we look at trends in the parameters, compute, and dataset size used to train ML systems. These are some of the most foundational metrics to keep track of in order to understand AI progress. 

There are several reasons for our focus on these metrics first, rather than other measures of AI development: 
We’re most interested in understanding the drivers of progress, particularly factors that can contribute to the development of TAI – we believe that measuring outputs or failure cases of AI systems are important too, however looking at these inputs is our first priority
These factors (i.e. parameters, compute, dataset size) are relatively easy to quantify and measure. For instance, training compute is fairly well-defined, however the “true capability” of AI is strongly contested and comparatively nebulous

Our work requires and involves active collaboration with many organisations, particularly in AI research, AI strategy or governance, and technical AI safety. In principle, we hope that our research can be used as a public good, for others to build on. We thus abide by the norm in ML to publish our work with open access, except in special circumstances (e.g. if there is a risk of infohazards). We hope that this allows people from a broad range of backgrounds to gain awareness of how AI is progressing as a field and a technology. 
2.1 Monitoring inputs of machine learning models
As mentioned previously, our work is centred around monitoring (i.e. continuously or frequently measuring) the inputs of ML models. In general, understanding the many drivers of AI progress is a very challenging problem due to the large number of confounding variables. 

To simplify the analysis, we divide the inputs of ML systems into two categories: 
First-order inputs: factors that directly influence the performance of a ML model, e.g. compute, data, algorithms
Second-order inputs: factors that indirectly influence the performance of a ML model, e.g. money, skill, talent
Categorising the inputs in this fashion means that most of the complexity is contained in the second-order inputs, such that we can focus on relatively simple problems for us to tackle (e.g. how has training compute or ML systems, without price or talent considerations, been changing over the past few decades?). Of course, our analysis cannot completely ignore the effects of second-order inputs, but we nevertheless believe this to be a reasonable starting approach. 
2.1.1 First-order inputs
Thus far, our research has focused on understanding trends in parameter counts, training compute, and training dataset set size for ML models. A key research output is the creation of a public dataset of notable ML systems together with these inputs (Sevilla et al., 2022). 

Understanding these first-order inputs is crucial for getting a better understanding of drivers of ML progress, and can enable future investigations that build on top of this. 

Possible future research questions include:
What is the relative importance of data vs compute?
What is the relative importance of algorithmic advances, versus the returns to scale?
What forecasts can we make based on our data? What does a naive extrapolation imply? What do more complex models suggest?
Why are there discontinuities in our data?
Is algorithmic progress slowing down?
2.1.2 Second-order inputs
However there are also some ML system inputs that are upstream of compute - in particular:
Money: This can be at a high level (e.g. which actors are allowed access to certain amounts of research funding), or at a lower level (e.g. how these actors use their money in order to advance their research, for instance spending on hew hardware vs hiring research assistants).
Skill and insights: Even with large amounts of spending, how much progress is made depends heavily on how much skill and insight is available. For instance, having sufficient research skills or experience means that funding can be used more efficiently. Having enough insight is particularly important for algorithmic progress, which is important for allowing systems to improve on the state-of-the-art (SotA). 
Talent: We’re also interested in the importance of the potential for developing new skills and insights. Thus, monitoring where talent is usually distributed (e.g. where students tend to work after finishing graduate studies in AI) is a part of our research focus - again this is particularly relevant from the perspective of TAI development, to help understand where TAI is most likely to be first developed. 

These can be harder to measure, since information about the amount of funding is often not released. Measuring variables like “talent” and “insights” also requires some degree of approximation, and coming up with suitable proxies (e.g. number of new AI PhD students from a certain country during a certain year). 

Possible research questions in this area include:
To what extent is the divide in access to compute between industry and academia caused by access to funding?
What are the relative costs of acquiring additional compute vs additional data?
What kinds of occupations do most AI PhD graduates work in? Where do they work? 
How important is funding, relative to talent?
What are the primary sources of compute in AI? (e.g. NVIDIA provides a large fraction of the hardware used for training AI systems today (Kobie, 2021))

Understanding these is key for making informed governance decisions, e.g. to decide who should have access to compute, and the feasibility of regulating algorithms. 
2.2 Monitoring outputs and capabilities
Of course, simply looking at the drivers of progress will not be sufficient if we do not also look into how the outputs and capabilities of AI systems are changing. 

In line with our emphasis on understanding the potential impacts from TAI, we believe that monitoring the capabilities of these systems can be highly informative for when we should expect TAI to be first developed. As such, we are considering the following research directions:
Understanding the evolution of key benchmarks: Different domains of AI have historically relied on different benchmarks, generally with increasing levels of difficulty. These have served as a rough guide for determining capabilities – for instance, the ability to beat human players at Go has long been regarded as a key milestone for reinforcement learning (Silver et al., 2016). What constitutes a key benchmark also changes over time – prior to the Deep Learning (DL) era, a key benchmark in Computer Vision was human-level performance on the MNIST digit recognition dataset (LeCun, 1998). However, achieving high performance on MNIST is no longer regarded as a particularly challenging problem for modern DL methods – instead, most Computer Vision experiments today (2022) are benchmarked on the ImageNet dataset (Deng, 2009).
Identifying problems with benchmarks: Of particular relevance to TAI is to use measures and benchmarks that accurately represent the capabilities of AI systems. Even if existing DL systems significantly outperform humans on tasks such as image recognition on ImageNet (Korzekwa, 2020), there is still much debate about whether or not these systems are truly able to “understand what they are seeing”. For instance, Goh et al. (2021) find that neural networks that have been trained on both text and image recognition are susceptible to typographic attacks, where text is placed in an image to result in an incorrect classification. Hendrycks et al. (2019) find related issues with other kinds of adversarial inputs. These suggest that the benchmarks we use may not be as informative of AI capabilities as they first seem. 
Monitoring new capabilities: One particularly concerning possibility as AI continues to develop is the emergence of novel behaviours in ML systems, where qualitatively different behaviours arise in the system due to a change in a quantitative parameter (Bommasani, 2021). For instance, Brown et al. (2020) demonstrate the emergence of the ability to do arithmetic in GPT-3, by making the model larger. This potentially poses emergent risks that can be very hard to foresee (Steinhardt, 2021). We hope to monitor these novel capabilities closely, as AI systems continue to be scaled up. 
[More stuff?]

Given these points, there are many different possible research questions that we might wish to pursue:
Is there any pattern to the newly emergent capabilities, and what are the largest factors that influence them?
What kinds of benchmarks would be the most useful for robustly understanding the capabilities of existing AI systems? 
How do benchmarks vary across different domains of ML? How influential are they?
How good are existing benchmarks for understanding the capabilities of AI systems, and are we overfitting to them?

2.3 Developing measurement tools and techniques
In addition to doing measurement work ourselves, we are excited for other researchers to contribute to our measurement efforts. However there are currently several bottlenecks to this:
Lack of measurement techniques: One of the largest obstacles to obtaining measurements is the lack of measurement techniques for different inputs and outputs. For instance, there is no clearly standardised definition for the “size” of a ML dataset, and we have found it necessary to come up with our own guidelines for how to measure this [link]. 
Missing norms around taking measurements: Another difficulty is that publishing information about key factors is not a sufficiently widely shared norm. For example, papers generally do not explicitly publish the number of floating point operations (FLOPs) required to train a ML model, or for the model to perform inference. We have thus had to infer the training compute used by researchers based on the published training time, and making assumptions (e.g. about the GPU utilisation rate, the hardware used, whether computations were done in half-precision, etc.). In some cases, information about hardware is further not mentioned. 
Difficulty in obtaining measurements: Even when obtaining measurements are possible, it is often not practical or too time consuming for them to be made. This implies that improving measurement techniques for ease of data acquisition can be crucial. 

In order to address the above problems, we have taken (or are planning to take) the following actions:
Proposing new measurement techniques: We have written a set of guidelines for measuring training compute and training dataset size of ML models
Developing tools that make data acquisition easier: For example, we hope to develop a PyTorch plugin that empirically measures the FLOPs required to train a ML model. This would allow for significant automation of the data acquisition process, making it much more likely that researchers publish their compute usage. 

For the time being (as these tools are being developed), we strongly encourage researchers and engineers to publish important details about their experiments (e.g. hardware usage). We are also open to collaboration on the development of these tools and guidelines for improving measurements. 

Possible directions include:
Developing a PyTorch plugin that automatically measures compute usage
Giving practical guidelines for measuring algorithmic improvements in ML
2.4 Other directions
There are many other research directions that we believe to be important that both decision makers and researchers pay close attention to. However, these directions are not currently within our capacity to research, and we support research in the following directions:
Monitoring attention in AI: To understand how the field of AI is likely to develop, we can investigate which fields of ML are the most popular and analyse how this has changed over time. 
Monitoring the AI safety landscape: As the field of AI safety continues to develop, we expect that certain research directions will become more neglected, or turn out to be more important than others. For instance, one possibility is that interpretability research continues to grow in popularity even outside of AI safety, and so is relatively less neglected compared to other research directions. Closely monitoring the AI safety landscape is helpful for ensuring that funding and resources are distributed appropriately. [probably this is the kind of thing that OpenPhil does, and we don’t really need to worry about this so much?]
Monitoring risks from AI systems: As AI systems become more powerful it is crucial that we get a better picture about where and how certain risks arise. These can be split into three categories (Zwetsloot, 2019):
Accident risks: Due to AI systems behaving in unintended ways. For instance, we might monitor examples of specification gaming in reinforcement learning models (Krakovna, 2020), or failure modes in interpretability techniques (e.g. saliency maps (Adebayo, 2018))
Misuse risks: Due to people using AI in a harmful manner, e.g. for the development of chemical weapons
Structural risks: Due to how AI affects the broader technological or societal environment in harmful ways
Doing this successfully would likely require a good understanding of how people are currently using and deploying AI systems. 
Monitoring AI Impacts: As an increasing number of AI systems get deployed in society, the impacts of AI systems are only going to continue growing. Understanding how these AI systems impact society (e.g. through the economy) is thus essential - work on this has been done by Grace et al. at AI Impacts. 
Monitoring procedures: To ensure that AI systems are being built and deployed in a safe fashion, we need to ensure that they are sufficiently transparent and that the procedures followed by developers of the AI are appropriate. For instance, the recent EU AI Act requires that AI systems must disclose that they are indeed AI, and that certain uses of AI are banned (European Commission, 2021). For AI safety in particular, there may in the future be required tests to ensure sufficient interpretability and robustness of performance across different use settings. 
3 Theory of change
By focusing on measuring inputs and outputs of AI systems and developing tools to help with monitoring AI progress, we hope to set a precedent for others who are also interested in similar research directions. In this section, we outline how we believe our work will benefit society and contribute to the development of safe and beneficial AI. 
3.1 Tackling foundational questions
Even as DL has been progressing at a rapid rate, we still lack an understanding of very fundamental questions about ML. For instance:
What is the relative importance of data and compute?
Why do we observe emergent behaviours in LLMs as they get scaled up (e.g. GPT-3)?
Why aren’t deep neural networks highly overparameterised, as classical statistics might predict?
Should we expect there to be diminishing returns to increasing model sizes?
Why isn’t algorithmic progress more important? Why does the bitter lesson seem to be true? (Sutton, 2019)
Is the scaling hypothesis true? (Branwen, 2020)

To try and tackle foundational questions like these, we hope that we can take an empirical approach – i.e. by gathering data about the capabilities and trends in ML. We hope that our work can help build an understanding of how different inputs affect ML system performance, and improve our understanding of scaling laws (Kaplan, 2020; Hoffmann, 2022), among other fundamental questions. 
3.2 Forecasting AI
We also believe that measuring progress in AI is useful for forecasting future developments. This is important for multiple reasons:
Anticipating AI capabilities and impacts: This is crucial if we want to be as well prepared as possible for a world with TAI; i.e. to take preemptive actions by speculating about the possibilities of AI. Doing this well however depends on our ability to ask the right questions – for instance, questions that are too vague or general are unlikely to yield accurate answers. This can be applied to both the capabilities of AI systems as well as its impacts, e.g. on the economy [(Besiroglu et al., 2022)?]. 
Making informed tradeoffs: Having forecasts about how the field of AI and AI safety will develop is essential for prioritising research. For instance, philanthropic donors may choose to fund more AI safety projects if they believe that TAI is likely to be developed sooner, and more emphasis might be placed on ambitious research agendas. This is done as a tradeoff – there are other domains of importance apart from AI safety as well. 

Our work on monitoring AI helps make the process of forming a forecast easier. First, it provides historical baselines which can be extrapolated to make predictions about the future. Second, it makes it easier to form concrete resolution criteria for forecasts. These results can also be used as inputs to future forecasts (e.g. similar to the Bio-anchors report forecasting TAI developments by Cotra (2020)).

While it is not possible to predict the future with complete certainty, forecasting can still be highly useful – in fact related forms of forecasting exist in other fields (e.g. the idea of speculation in economics). Successful forecasts of technological developments have also been made in the past, a notable example being Moore’s Law (Moore, 1965; Borkar, 2011). 

It can be highly informative to understand how accurate these forecasts are, by making it publicly available when they are proven to be correct or wrong. An example of this is done by Hoffmann et al. (2022), where they publish forecasted model performance together with the actual results. 

Possible research questions include:
How much spending will be devoted to DL research by the US government in 2025?
Is there a growing divide in access to compute between industry and academia?
When should we expect TAI?
When will AI systems first win a gold medal in the International Mathematical Olympiad?
3.3 Supporting effective AI governance
We can think of the AI governance landscape as going from work that is more foundational (e.g. broad AI strategy) to applied work (e.g. enacting policies). We see our empirical work as contributing at both of these levels. 
Supporting AI policy or decision makers
A major problem throughout technology policy is that policymakers often lag behind the rapid pace of technological developments, and this is also true for AI – progress occurs so quickly that even technical researchers find themselves unable to keep up. In addition, policymakers generally lack the time to learn about and develop high-level intuitions about AI, exacerbating the problem.

One way of improving this situation is to gather and synthesise data that is quickly accessible and provides a big picture overview of how AI is developing, thus leading to better informed decisions. Our work hopes to contribute to this, and we hope to work with decision makers to measure things that are specifically tailored to their needs. 

Some examples of policy questions that we contribute to are:
Allocating funding: Monitoring the developments of AI helps determine which domains are the most important, such that decision makers can better allocate funding and focus their attention. 
Compute governance: Due to the potential serious risks of TAI, we want to ensure that only trusted actors are allowed access to the compute to train powerful AI systems. This is particularly feasible for compute (e.g. as opposed to data or algorithms) because hardware is relatively difficult to obtain or conceal (Heim, 2021). We believe that our work on monitoring compute usage by different actors has the potential to be helpful for future compute governance efforts. 
Supporting AI strategy
As mentioned, our work also contributes to higher-level AI strategy. For instance, monitoring who currently has access to the most compute can be useful for understanding the current international landscape of AI capabilities. This is particularly relevant for understanding topical questions, such as the relative competitiveness of the US and China in AI both currently and in the future (Ding, 2019; Khan and Flynn, 2020). 

A key difficulty regarding AI strategy is that our collective understanding of foundational questions in AI is still limited, making it hard to know what regulations are appropriate for reducing risks without jeopardising positive technological developments. Again, we hope that our work with monitoring AI progress provides first steps towards doing this successfully, e.g. by better understanding how AI systems are misused, and what factors are most likely to lead to risky scenarios. 
3.4 Improving awareness and encouraging further work
Our final ambition is to have additional indirect positive impacts on the broader AI governance and technical R&D landscape, through two means:
Improving awareness: We hope that by publicly sharing our work, we can help others better understand the importance of closely monitoring AI progress from a safety perspective. This way, we can encourage greater engagement in this area.
Shifting publication norms: By making measurements easier (via providing guidelines and developing measurement tools), we hope to foster a community norm of safety and publishing important details about ML experiments, e.g. training compute usage. 
Both of these make it easier to do similar work going forward, and ultimately help with the development of safe and beneficial AI systems. 
Acknowledgements
We would like to thank [people] for their useful comments and feedback.
References
Jaime Sevilla, Lennart Heim, Anson Ho, Tamay Besiroglu, Marius Hobbhahn, Pablo Villalobos. Compute Trends Across Three Eras of Machine Learning. 11 Feb 2022. https://arxiv.org/abs/2202.05924 


Extra Stuff
Ambitious Goals
Measurements for things that are relevant to AIS: quantifying interpretability, robustness, alignment, the alignment tax
In the long run, we hope to be ambitious and gather measurements based on improved AI safety techniques. For instance, we hope to gather around 
In the future → measuring misalignment (in LLMs - Beth Barnes?), quantifying interpretability, quantifying robustness, quantifying corrigibility. Would be really helpful! Can imagine future where we’d need systems to pass these sorts of tests
Seems like a super cool research direction and über important. Prob would require strong collab with other researchers/orgs. 
[I’m really keen on discussing/fleshing out this idea]
Long term - combine techniques to devise an AI “deployment test”
Doesn’t feel tractable at present, but would love to see smth like this in future 
Make sure humanity can expand into the lightcone
Anson’s Mind Dumps
[Idea I’m quite uncertain about: a new field of technical AI safety work - “governance-guided AIS”
Currently most technical work is done by people sniffing around and determining what they think are the most important problems for AI alignment directly
This is a good thing! We’ll trust that they can find the best things to help solve the technical aspects of alignment
But we also want some meta-considerations: we need to help people in governance (e.g. understand what’s going on), and people in governance can try and help in return (e.g. regulating which actors have access to compute)
Introducing: governance-guided AIS
People in governance have a certain problem that they want to solve, but it requires a technical solution
E.g. How interpretable does a ML model need to be in order for us to (1) do attribution of crimes to different actors, (2) prevent deceptive alignment?
Then people working in G-GAIS (horrible acronym) try and solve this problem deliberately, and return an answer to the governance workers
Pros: 
Improves coordination between technical and governance researchers
There is a more deliberate procedure that can improve efficiency, rather than having to get researchers to specialise in other things to things that they’re less good at
Cons:
I’m not sure how answerable some of the governance qns might be
I don’t know if this is really more efficient - e.g. for the qn above isn’t it better for the ppl in gov to just ask the ppl working on interpretability, rather than having a group of different researchers playing along?
Uncertainties:
I feel like I’m conflating “having a specialised group of researchers working at the intersection of AIG and AIS” with “creating a new research direction
What about “technically-guided governance? This is starting to feel a little silly. Michael Aird told me it’d be good if more people in gov had a really good tech understanding]
Accident risks, structural risks too → link to GovAI work
For the things under “Other directions” - Why aren’t we monitoring these things currently?
