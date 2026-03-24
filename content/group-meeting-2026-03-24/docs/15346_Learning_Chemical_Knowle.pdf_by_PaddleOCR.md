# LEARNING CHEMICAL KNOWLEDGE FROM LARGE SCALE UNLABELED MOLECULAR DATA FOR RET ROSYNTHESIS  

Anonymous authors Paper under double-blind review 

## ABSTRACT 

Retrosynthesis, the process of predicting reactants from products, remains a critical challenge in computational chemistry and drug discovery. While recent deep learning methods have shown strong performance, they remain overly reliant on reaction datasets, which are limited in availability and quality. Large-scale unlabeled molecular data encode rich structural patterns that can be leveraged to learn transferable chemical knowledge, but remain largely unexplored. In this work, we propose KnowRetro (Knowledge-Guided Retrosynthesis Prediction), a chemically-aware framework that learns chemical knowledge from large-scale unlabeled molecules to enhance the accuracy and diversity of retrosynthesis prediction. Specifically, KnowRetro first builds a hierarchical knowledge graph from millions of unlabeled molecules, which captures transformation-relevant relationships among molecules, substructures, and functional groups. It then employs chemically guided pre-training based on substructure decomposition to encourage the model to capture fundamental reaction patterns, followed by fine-tuning with a KG adapter designed to inject task-relevant knowledge into reactant generation.Extensive experiments demonstrate that KnowRetro achieves high accuracy with improved robustness and diversity in reactant generation. Our code is available at https://anonymous.4open.science/r/KnowRetro-9C5A.


## 1 INTRODUCTION 

Retrosynthesis is a foundational methodology in synthesis planning that deconstructs complex molecules into simpler precursors (Corey & Cheng, 1989), enabling pathway design and advancing computational chemistry and drug discovery (Blakemore et al., 2018; Szymkuć et al., 2016).

Traditional retrosynthesis methods rely on expert intuition and predefined rules (Corey et al., 1985;Grzybowski et al., 2018). While effective for well-known or similar compounds, these approaches face challenges in navigating the vast and intricate chemical space (Bostrom et al., 2018), limiting their adaptability to diverse reactions. The advent of artificial intelligence (AI) and the availability of reaction datasets (Lowe, 2012) have accelerated the shift toward data-driven retrosynthesis. Early works focused on automating the extraction and application of reaction templates (Coley et al., 2017;Segler & Waller, 2017; Dai et al., 2019; Chen & Jung, 2021; Xie et al., 2023), which improved the scalability and interpretability of retrosynthesis. Building upon these advances, data-driven methods further leverage deep learning to directly learn chemical transformations from reaction data.Sequence-to-sequence models (Karpov et al., 2019; Zheng et al., 2019; Tetko et al., 2020; Zhong et al., 2022; Wan et al., 2022; Han et al., 2024) and graph-to-sequence models (Tu & Coley, 2022;Zeng et al., 2024) have shown strong flexibility and predictive performance. However, the chemical knowledge captured by these approaches remains largely implicit and constrained by the scope of available reaction datasets, limiting their ability to capture underlying reaction principles. To mitigate this limitation, recent works augment data-driven models with explicit reaction-level supervision. Reaction-center prediction provides atom- and bond-level supervision at transformation sites (Yan et al., 2020; Shi et al., 2020; Wang et al., 2021; Sacha et al., 2021; Zhong et al., 2023;Wang et al., 2023; Chen et al., 2023; Zhao et al., 2025), while reaction-type classification (Jiang et al., 2023) imposes global constraints that capture characteristic reaction patterns. By incorporating such reaction-specific signals, these methods improve predictive performance in retrosynthesis,

but the supervision they rely on remains restricted to labeled reaction datasets, which inherently limits their applicability.



Based on the above discussion, most existing retrosynthesis methods rely primarily on reaction datasets, which are limited in availability and quality, leaving the structural knowledge in unlabeled molecular data largely unexplored. As illustrated in Figure la, structural relations among molecules,substructures, and functional groups can capture plausible transformation pathways even without explicit reaction annotations, highlighting the potential of unlabeled molecular data to support knowledge-driven retrosynthesis.To bridge this gap, we introduce KnowRetro, a 

<div style="text-align: center;"><img src="https://pplines-online.bj.bcebos.com/deploy/official/paddleocr/general-layout-parsing-v3//151a8d55-38d9-436b-9e93-845ebbea5d3c/markdown_1/imgs/img_in_image_box_491_250_1003_483.jpg?authorization=bce-auth-v1%2FALTAKzReLNvew3ySINYJ0fuAMN%2F2026-03-23T18%3A06%3A45Z%2F-1%2F%2F89e88e0481ace1db45b3a1c8480118353a7b31c52f5faa1a945af0bc8faa6902" alt="Image" width="41%" /></div>


<div style="text-align: center;">Figure 1: (a) An illustration of the Chemical KG from unlabeled molecules showing compounds, substructures, and functional groups linked by transformation paths. (b) KnowRetro with unlabeled knowledge outperforms its variant without it on USPTO-50K and USPTO-FULL. </div>


chemically-aware framework that systematically learns chemical knowledge from large-scale unlabeled molecules to guide retrosynthesis prediction. Specifically, KnowRetro constructs a hierarchical chemical knowledge graph (KG) that encodes transformation-relevant relationships among molecules,substructures, and functional groups at multiple levels. To better integrate chemical knowledge, we combine chemically guided pre-training, which captures substructure-level reaction patterns, with a fine-tuning stage where a KG adapter distills task-relevant knowledge for robust reactant prediction. Figure 1b show that KnowRetro consistently improves retrosynthesis accuracy on both USPTO-50K and USPTO-FULL by leveraging knowledge from unlabeled molecules.

The contributions of KnowRetro are as follows: (1) We introduce a knowledge-guided retrosynthesis framework that systematically leverages hierarchical chemical knowledge from large-scale unlabeled molecules, offering a complementary knowledge source beyond labeled reaction datasets;(2) We design a knowledge-guided learning paradigm that performs chemically guided pre-training to capture transferable reaction patterns, followed by fine-tuning with a KG adapter that distills taskrelevant knowledge for robust prediction; (3) Experiments on benchmark datasets demonstrate that KnowRetro consistently outperforms baselines, achieving superior performance, robustness, and diversity, while capturing key reaction-related knowledge in its learned representations.

## RELATED WORK 

Single-step Retrosvnthesis Prediction. Rule-based methods relied on pre-defined reaction templates, where expert knowledge of atom- and bond-level transformations was explicitly encoded into template libraries. While explicit template encoding provides interpretability and enforces chemically valid transformations, dependence on a fixed library of pre-defined templates from reaction data restricts scalability (Coley et al., 2017; Segler & Waller, 2017; Dai et al., 2019). With the advent of reaction datasets, data-driven methods have become dominant. Sequence-to-sequence approaches (Karpov et al., 2019; Zheng et al., 2019; Tetko et al., 2020; Zhong et al., 2022; Han et al., 2024) formulate retrosynthesis as a translation task, offering scalability but often struggling with invalid predictions and limited diversity. Graph-to-sequence frameworks (Tu & Coley, 2022;Zeng et al., 2024) further exploit molecular graph structures to better preserve chemical context and improve prediction validity. Despite these advances, the chemical knowledge captured by such approaches remains largely implicit and is constrained by the scope of available reaction datasets,limiting their ability to capture underlying reaction principles. Recent works further enhance datadriven models with auxiliary reaction-level supervision, including reaction-center prediction that provides atom- and bond-level signals on transformation sites (Yan et al., 2020; Sacha et al., 2021;Wang et al., 2021; Chen et al., 2023; Zhao et al., 2025; Zhong et al., 2023), and reaction-type classification that imposes global constraints on reaction patterns (Jiang et al., 2023). The performance 

<div style="text-align: center;"><img src="https://pplines-online.bj.bcebos.com/deploy/official/paddleocr/general-layout-parsing-v3//151a8d55-38d9-436b-9e93-845ebbea5d3c/markdown_2/imgs/img_in_image_box_218_165_1002_379.jpg?authorization=bce-auth-v1%2FALTAKzReLNvew3ySINYJ0fuAMN%2F2026-03-23T18%3A06%3A48Z%2F-1%2F%2F3d66036ab1262ca7734b569a5d1d77f2cc61ec34443131e5e2217d81f13061af" alt="Image" width="64%" /></div>


<div style="text-align: center;">Figure 2: Overview of the KnowRetro framework. (a) Molecules are decomposed into substructures and functional groups to form a multi-level KG $G_{k g},$ , which is then encoded by a hierarchicalknowledge encoder; (b) Reaction-aware pretraining via SMILES-to-substructure translation; (c) For retrosynthesis, the product-side knowledge retrieved in (a) is distilled into a informative latent representation by a task-relevant knowledge adapter. This representation conditions the reaction-aware encoder from (b), enabling it to produce knowledge-augmented embeddings that guide the reactant decoder in generating reactants. Symbols: ⊕ indicates addition; ⊙ denotes element-wise product.</div>


gains of these strategies demonstrate the value of incorporating auxiliary reaction-level supervision into retrosynthesis, yet they fundamentally depend on annotated reaction datasets, leaving the transferable chemical information embedded in unlabeled molecular data largely underexplored.

Chemical Knowledge Graphs. KGs have been successfully applied in fields such as drug repurposing (Pan et al., 2022) and drug-drug interaction (Lin et al., 2020). To introduce fundamental chemical domain knowledge, specialized chemical KGs have been developed. For instance, chemical element-level KGs incorporate properties like electronegativity to represent fundamental molecular characteristics (Fang et al., 2022).  Similarly, reaction-level KGs represent molecular transformations by modeling reactants and products as nodes, with reaction templates as edges, providing a structured framework for understanding connectivity changes during reactions (Xie et al., 2024).However, existing KGs often overlook multi-level reaction knowledge, critical for modeling the localized structural changes of chemical reactions. Our work addresses this by constructing a hierarchical chemical KG from unlabeled molecules, capturing relations among molecules, substructures,and functional groups to supply a new source of transferable reaction knowledge.

## 3 PROPOSED METHOD 

Problem Definition. In this work, we formulate retrosynthesis prediction as a sequence-to-sequence translation task, integrating hierarchical chemical knowledge within an end-to-end learning framework. The goal is to generate a valid set of reactants from a given product molecule. Given a product molecule $x\in\mathbb{\hat{M}}$ , represented as a SMILES sequence $x\:=\:[x_{1},x_{2},\ldots,x_{m}]$ with m tokens, where M denotes the molecular space. The model aims to generate a reactant sequence $y^{\mathrm{r x n}}=[y_{1},y_{2},\ldots,y_{n}]$ , constructed by concatenating the SMILES strings of all reactants using the dot symbol (.) and tokenizing the result into n tokens. Generation is performed in an autoregressive manner, where each token is predicted conditioned on the product and previously generated tokens.The model is trained by minimizing the negative log-likelihood of the ground-truth sequence over the training dataset D:

$$\mathcal{L}_{\mathtt{g e n}}(\theta)=-\sum_{(x,y^{\mathtt{r x n}})\in\mathcal{D}}\sum_{t=1}^{n}\operatorname{l o g}P_{\theta}(y_{t}^{\mathtt{r x n}}\mid y_{<t}^{\mathtt{r x n}},x),$$

where θ denotes model parameters. We adopt teacher forcing during training, providing the groundtruth prefix $y_{<t}^{\mathrm{r x n}}$ at each decoding step.



Overview. Here, we propose KnowRetro, a knowledge-guided retrosynthesis framework that integrates hierarchical chemical knowledge from large-scale unlabeled molecules with molecular sequence modeling for retrosynthesis prediction. The overall architecture of KnowRetro is shown in Figure 2, which is divided into three modules: (a) Given large-scale unlabeled molecules, hierarchical chemical knowledge is constructed by decomposing molecules into substructurs and 

functional groups, forming a multi-level chemical knowledge graph encoded by a hierarchialknowledge encoder (Section 3.1); (b) We pretrain a reaction-aware encoder–decoder via a SMILESto-substructure translation objective designed to recover chemically meaningful fragments from input molecules. This pretraining stage enables the model to capture general fragment-level reactivity patterns; (c) For the downstream retrosynthesis task, product knowledge retrieved in (a) is distilled into a informative latent representation by a task-relevant knowledge adapter, which conditions the reaction-aware encoder from (b). The knowledge-augmented encoder representation is then used by a reactant decoder to generate reactants (Section 3.3).



### 3.1 HIERARCHICAL CHEMICAL KNOWLEDGE GRAPH REPRESENTATION 

Hierarchical Knowledge Graph Construction. Unlike previous works that primarily focused on constructing knowledge graphs from chemical elements (Fang et al., 2022) (e.g., attributes from the Periodic Table) and reaction-level data (Xie et al., 2024) (e.g., representing reactants and products as nodes with templates as relations), we construct a hierarchical chemical knowledge graph from large-scale unlabeled molecules, capturing hierarchical relationships among molecules, substructures, and functional groups to model structural transformations in chemical reactions. Specifically,we decompose molecules into meaningful substructures and functional groups using chemically guided algorithms. BRICS decomposition (Degen et al., 2008) generates synthetically relevant building blocks by breaking molecular bonds,$x\xrightarrow{\mathtt{B R I C S}}\{s_{1},s_{2},\ldots,s_{k}\}$ ,where $x\in\mathcal{M}$ denotes molecule, and $\{s_{1},s_{2},\ldots,s_{k}\}$ ·represents the substructures obtained from it. The number of substructures, k, depends on the molecular complexity, with each substructure s preserving chemically meaningful and synthetically relevant fragments. Functional groups are identified using SMARTSbased matching with RDKit tool (Landrum et al., 2013),$s_{i}\xrightarrow{\mathsf{S M A R T S}}\{{f g}_{1},{f g}_{2},\ldots,{f g}_{t}\}$ ,where $\{\widetilde{{f g}}_{1},\widetilde{{f g}}_{2},\ldots,\widetilde{{f g}}_{t}\}$ ·are the functional groups identified within substructure $s_{i}.$ ,and t denotes the number of identified groups, ensuring accurate detection of key reactive sites. The resulting chemical knowledge graph $\mathcal{G}_{\mathrm{k g}}$ encodes hierarchical relationships among molecules, substructures, and functional groups. Formally, it is defined as $\mathcal{G}_{k g}=(\mathcal{V},\mathcal{E},\mathcal{R})$ 1, where V denotes nodes, including molecules, substructures, and functional groups; E represents the edges capturing their relationships;and R specifies relation types, such as has _substructure and has funcgroup. This KG serves as a foundation for capturing reaction patterns through hierarchical structural relationships.

Encoding of Hierarchical Knowledge. To capture the structural and relational knowledge within the KG, we employ a 2-layer Relational Graph Convolutional Network (RGCN) (Schlichtkrull et al.,2018), which incorporates relation types into message passing to capture hierarchical chemical dependencies. The node update process at each layer is defined as:

$$\mathbf{e}_{i}^{(l+1)}=\sigma\left(\sum_{r e l\in\mathcal{R}}\sum_{j\in\mathcal{N}_{i}^{r e l}}\frac{1}{c_{i,r e l}}\mathbf{W}_{r e l}^{(l)}\mathbf{e}_{j}^{(l)}+\mathbf{W}_{o}^{(l)}\mathbf{e}_{i}^{(l)}\right),$$

where $\mathbf{e}_{i}^{(l)}$ and $\mathbf{e}_{j}^{(l)}$ denote the embeddings of node i and its neighborj at layer l;$\mathbf{W}_{r e l}^{(l)}$ is the relationspecific transformation matrix for relation rel $\in\mathcal{R};\mathcal{N}_{i}^{r e l}$ denotes the set of neighbors of node i under relation rel;$c_{i,r e l}=|\mathcal{N}_{i}^{r e l}|$ is a normalization factor;$\mathbf{W}_{o}^{(l)}$ is the self-loop transformation for node i; and $\sigma(\cdot)$ is a nonlinear activation function e.g, ReLU).Theoptimization objectives:

$$\begin{aligned}{\mathcal{L}_{\operatorname{k g}}=-\frac{1}{|E|}\sum_{({h e a d},{r e l},{t a i l},y^{\operatorname{k g}})\in E}}&{{}\Big[y^{\operatorname{k g}}\operatorname{l o g}\big({\operatorname{s i g m o i d}}(f({h e a d},{r e l},{t a i l}))\big)}\\ {}&{{}+(1-y^{\operatorname{k g}})\operatorname{l o g}\big(1-{\operatorname{s i g m o i d}}(f({h e a d},{r e l},{t a i l}))\big)\Big]}\\ \end{aligned}$$

where E includes both positive triples from E and negative triples generated via negative sampling. The binary label $y^{k g}\in\{0,1\}$ ·indicates whether a triple is valid $(y^{k g}~=~1)$ or corrupted $(y^{k g}\;=\;0)$ The scoring function follows the DistMult formulation (Yang et al., 2014),f (head, rel,$t a i l)~{=}~\mathbf{e}_{h e a d}^{\top}R_{r e l}\overset{\circ}{\mathbf{e}}_{t a i l}$ ,where $R_{r e l}\in\mathbb{R}^{d\times d}$ is a diagonal matrix specific to relation rel, and $\mathbf{e}_{{h e a d}},\mathbf{e}_{{t a i l}}\in\mathbb{R}^{d}$ are the embeddings of the head and tail entities, respectively. This objective encourages high scores for valid triples and low scores for invalid ones, guiding the encoder to capture chemically meaningful hierarchical semantics that reflect underlying reaction transformations. The final product embedding eproduct encodes its structured context and serves as the input 

for the retrosynthesis prediction module. Importantly, the architecture is not limited to RGCN and can accommodate alternative KG encoders such as TransE (Bordes et al., 2013), RotatE (Sun et al.2019), and their variants. Additional details are provided in Appendix B.2.

### 3.2 REACTION-AWARE PRE-TRAINING 

To infuse the encoder with retrosynthetic priors, we design a pre-training objective that recovers chemically meaningful fragment sequences from input molecules. Using the BRICS algorithm (Degen et al., 2008), molecules are decomposed by cleaving retrosynthetically significant bonds based on 16 predefined disconnection rules. The resulting fragments retain key substructures and reflect the chemical environment around cleavage sites. Given a molecule $x\quad=\quad[x_{1},x_{2},\ldots,x_{m}]$ ,represented as a SMILES token sequence, we construct the target fragment sequence $u\quad=\quad[u_{1},u_{2},\ldots,u_{L}]$ by tokenizing the dot-concatenated fragments. For instance, the molecule $\dot{C}C(=O)c1ccc2\dot{c}(ccn2C(=O)\dot{OC}(C)C)c1$ is decomposed into three fragments:$CC=O,\;O=CnICC\stackrel{\frown}{2}CCCC2I$ ,and $C C(C)(C)O$ , which are concatenated as $CC=O.O=\bar{CnI}ccc2ccccc2I.CC(C)(C)O$ to form the target. The model is trained autoregressively to generate each fragment token conditioned on the molecule and previously generated tokens:

$$\mathcal{L}_{\mathsf{p r e t r a i n}}=-\operatorname{l o g}P(u|x)=-\sum_{i=1}^{L}\operatorname{l o g}P(u_{i}\mid u_{<i},x).$$

This task enables the encoder to capture fragment-level structural patterns and recognize plausible disconnection sites, providing a stronger initialization for downstream retrosynthesis modeling.

### 3.3 KNOWLEDGE-GUIDED RETROSYNTHESIS PREDICTION 

Task-relevant Knowledge Adapter. While KG embeddings encode rich structural and relational semantics, they may also contain task-irrelevant or redundant information that hinders downstream performance. Motivated by the variational information bottleneck principle (Sun et al., 2022), we propose a task-relevant knowledge adapter to further filter redundant signals and retain information essential for retrosynthesis. Given a product embedding $\mathbf{e}_{\mathrm{p r o d u c t}}\in\widetilde{\mathbb{R}}^{d}$ obtained from the KG encoder, we model the approximate posterior distribution of the latent variable $\mathbf{z}_{\mathrm{p r o d u c t}}$ as a multivariate Gaussian:

$$p(\mathbf{z}_{\mathrm{p r o d u c t}}\mid\mathbf{e}_{\mathrm{p r o d u c t}})=\mathcal{N}\left(f_{\phi}^{\mu}(\mathbf{e}_{\mathrm{p r o d u c t}}),\;f_{\phi}^{\Sigma}(\mathbf{e}_{\mathrm{p r o d u c t}})\right),$$

where $f_{\phi}^{\mu}(\cdot)$ and $f_{\phi}^{\Sigma}(\cdot)$ +denote the neural network outputs for the mean vector and the diagonal covariance matrix, respectively. Specifically, the output of $f_{\phi}^{\Sigma}(\cdot)$ is passed through a softplus transformation to ensure positive semi-definiteness, which enables analytical computation of the Kullback-Leibler (KL) divergence (Hershey & Olsen, 2007). A latent vector $\mathbf{z}_{\mathrm{p r o d u c t}}$ is then sampled using the reparameterization trick (Kingma et al., 2013):

$$\mathbf{z}_{\operatorname{p r o d u c t}}=f_{\phi}^{\mu}(\mathbf{e}_{\operatorname{p r o d u c t}})+f_{\phi}^{\Sigma}(\mathbf{e}_{\operatorname{p r o d u c t}})\odot\mathbf{\epsilon},\quad\mathbf{\epsilon}\sim\mathcal{N}(\mathbf{0},\mathbf{I}),$$

where  denotes element-wise multiplication. To regularize information flow and retain only taskrelevant information, we apply a KL divergence penalty between the approximate posterior and a standard isotropic Gaussian prior, formulated as:

$$\mathcal{L}_{\operatorname{I B}}=\operatorname{D_{K L}}\left(p(\mathbf{z}_{\operatorname{p r o d u c t}}\mid\mathbf{e}_{\operatorname{p r o d u c t}})\parallel\mathcal{N}(\mathbf{0},\mathbf{I})\right),$$

where $\mathrm{D}_{\mathrm{K L}}(\cdot\|\cdot)$ denotes the KL divergence.

Knowledge Injection. To incorporate the task-relevant representation into the generation process,$\mathbf{z}_{\mathrm{p r o d u c t}}$ is projected via a learnable linear transformation to obtain $\tilde{\mathbf{e}}_{\mathrm{p r o d u c t}}$ , which is then injected into both the encoder and decoder through residual fusion. In the encoder, this is implemented by a residual connection where $\mathbf{h}_{\mathrm{e n c}}^{(l+1)}\;=\;\operatorname{T r a n s f o r m e r E n c o d e r}(\mathbf{h}_{\mathrm{e n c}}^{(l)}+\tilde{\mathbf{e}}_{\mathrm{p r o d u c t}})$ ,where $\left[\mathbf{h}_{\mathrm{e n c}}^{(l)}\right.$ :denotes the hidden state at layer l. In the decoder,$\tilde{\mathbf{e}}_{\mathrm{p r o d u c t}}$ enriches the cross-attention mechanism, with $Q\;=\;\mathbf{W}_{Q}\mathbf{h}_{\mathrm{dec}}^{(l)},\;K\;=\;\mathbf{W}_{K}(\mathbf{h}_{\mathrm{enc}}^{(l+1)}+\tilde{\mathbf{e}}_{\mathrm{product}}),\;V\;=\;\mathbf{W}_{V}(\mathbf{h}_{\mathrm{enc}}^{(l+1)}+\tilde{\mathbf{e}}_{\mathrm{product}})$ Attention is then computed as softmax $(Q K^{\top}/{\sqrt{d}})V$ ,where $\mathbf{h}_{\mathtt{d e c}}^{(l)}$ is the decoder hidden state, and $\mathbf{W}_{Q},\mathbf{W}_{K},\mathbf{W}_{V}$ are learnable projection matrices. This dual-path strategy enables more accurate reactant generation.

Joint Training Objective. The final training objective jointly minimizes the autoregressive generation loss (Eq. 1) and the KL regularization term (Eq. 7):

$$\mathcal{L}_{\mathrm{t o t a l}}=\mathcal{L}_{\mathrm{g e n}}+\beta\mathcal{L}_{\mathrm{I B}},$$

where the coefficient β balances generation accuracy against the need to compress information. This objective encourages the model to generate syntactically valid and chemically plausible reactants while incorporating task-relevant structural semantics distilled from the KG.

### 3.4 THEORETICAL ANALYSIS 

The knowledge adapter distills task-relevant signals from product embeddings by filtering semantic noise from the knowledge graph, guided by the Information Bottleneck principle, which formalizes the trade-off between informativeness and compression.



Definition 1 (Information Bottleneck). Given a product embedding $\mathbf{e}_{p r o d u c t}$ and its corresponding reactant sequence $y^{r x n}$ 

$$\arg\operatorname*{m i n}_{\mathbf{z}_{\mathrm{p r o d u c t}}}-I(\mathbf{z}_{\mathrm{p r o d u c t}};y^{\mathrm{r x n}})+\beta I(\mathbf{z}_{\mathrm{p r o d u c t}};\mathbf{e}_{\mathrm{p r o d u c t}}),$$

where $I(A;B)=H(A)-H(A|B)$ denotes the Shannon mutual information (Cover, 1999; Ma et al., 2025) and $\beta>0$ balances task relevance and representation compression.

Intuitively, the first term encourages alignment with the prediction target, while the second penalizes excessive dependence on the input embedding. To formalize the effect of filtering out irrelevant information, we consider $\mathbf{e}_{n}$ as a task-independent component of $\mathbf{e}_{\mathrm{p r o d u c t}}$ , such as structural noise or KG-specific redundancy. Under the following Markov assumption:$<\left(y^{\mathrm{r x n}},\mathbf{e}_{n}\right)\rightarrow\mathbf{e}_{\mathrm{p r o d u c t}}\rightarrow$ Zproduct >, the learned representation $\mathbf{z}_{\mathrm{p r o d u c t}}$ should ideally be invariant to $\mathbf{e}_{n}$ 

Lemma 1 (Task-Relevant Knowledge Extraction). Under the assumption above, the mutual information between $\mathbf{z}_{p r o d u c t}$ and the task-independent component $\mathbf{e}_{n}$ satisfies:

$$I(\mathbf{z}_{\operatorname{p r o d u c t}};\mathbf{e}_{n})\leq I(\mathbf{z}_{\operatorname{p r o d u c t}};\mathbf{e}_{\operatorname{p r o d u c t}})-I(\mathbf{z}_{\operatorname{p r o d u c t}};y^{\operatorname{f x n}}).$$

A formal proof is provided in Appendix C.1. Lemma 1 shows that minimizing the IB objective reduces mutual information with irrelevant noise. In practice, we implement this via a KL loss for latent regularization and a generation loss to encourage task-specific representation (see Eq. 8).

## 4 EXPERIMENTS 

We investigate the following questions to assess KnowRetro: RQ1) Does KnowRetro outperform existing baselines? RQ2) How does structured knowledge integration improve retrosynthesis prediction? RQ3) Is KnowRetro robust and diverse in leveraging knowledge for retrosynthesis?

### 4.1 EXPERIMENTAL SETUP 

We describe the datasets, evaluation metrics, and baselines below. Additional implementation details, including hyperparameters and training procedures, are provided in Appendix A.1 and B.1.

Datasets. We utilize two types of data: large-scale unlabeled molecular data, which support both knowledge graph construction and self-supervised pretraining, and benchmark reaction datasets for training and evaluation. (1) KG construction. We build a hierarchical chemical KG using molecular structures from USPTO-derived molecules (USPTO-50K (Coley et al., 2017), USPTO-MIT (Jin et al., 2017), USPTO-FULL (Dai et al., 2019; Lowe, 2012)) and 250K additional molecules from ZINC15 (Sterling & Irwin, 2015; Zhang et al., 2021). Each molecule is decomposed into BRICSbased substructures and SMARTS-defined functional groups, and the resulting graph encodes relationships among molecules, substructures, and functional groups. (2) Pretraining. For selfsupervised pretraining, we use 10M molecules from PubChem (Zeng et al., 2022), where the encoder learns to predict BRICS fragments from input molecules in a reaction-agnostic manner. (3)Retrosynthesis benchmarks. We evaluate on two widely used benchmarks. The USPTO-50K dataset contains 50.016 reactions across 10 classes with a standard 40K/5K/5K train/validation/test split.evaluated under both Known (reaction class provided) and Unknown (without reaction class labels)

<div style="text-align: center;">Table 1: Top-k accuracy (%) on USPTO-50K under reaction class unknown and known settings.Models are grouped by knowledge type. Bold indicates the best result;;"-"indicates not reported results or not supported class known setting. Results of USPTO-FULL refer to Appendix B.6.</div>



<div style="text-align: center;"><html><body><table border="1"><thead><tr><td rowspan="2">Type</td><td rowspan="2">Model</td><td colspan="4">7.1 82.1 88.1 92</td><td colspan="4">Reaction Class Known</td></tr><tr><td colspan="4"></td><td colspan="4"></td></tr></thead><tbody><tr><td rowspan="5">k = 1</td><td>$k=3$</td><td>$k=5$</td><td>$k=10$</td><td>$k=1$</td><td>$k=3$</td><td>$k=5$</td><td>$k=10$</td><td></td><td></td></tr><tr><td>Rule-based</td><td>RetroSim</td><td>37.3</td><td>54.7</td><td>63.3</td><td>74.1</td><td>52.9</td><td>73.8</td><td>81.2</td></tr><tr><td>86.0 86.0 −</td><td>44.4</td><td>65.3</td><td>72.4</td><td>78.9</td><td>55.3</td><td>76.0</td><td>81.4</td><td>85.1</td></tr><tr><td>GLN</td><td>52.5 53.4</td><td>74.6 77.5</td><td>80.5</td><td>86.9 92.4</td><td>64.2 63.9</td><td>79.1 86.8</td><td>85.2 92.4</td><td>90.0</td></tr><tr><td>RetroKNN</td><td>57.2</td><td>78.9</td><td>86.4</td><td>92.7</td><td>66.7</td><td>88.2</td><td>93.6</td><td>96.6</td></tr><tr><td rowspan="8">Knowledge-enhanced</td><td>G2Gs</td><td>48.9</td><td>67.6</td><td>72.5</td><td>75.5</td><td>61.0</td><td>81.3</td><td>86.0</td><td>88.7</td></tr><tr><td>RetroXpert</td><td>50.4</td><td>61.1</td><td>62.3</td><td>63.4</td><td>62.1</td><td>75.8</td><td>78.5</td><td>80.9</td></tr><tr><td>MEGAN</td><td>48.1</td><td>70.7</td><td>78.4</td><td>86.1</td><td>60.7</td><td>82.0</td><td>87.5</td><td>91.6</td></tr><tr><td>GraphRetro</td><td>53.7</td><td>68.3</td><td>72.2</td><td>75.5</td><td>63.9</td><td>81.5</td><td>85.2</td><td>88.1</td></tr><tr><td>Retroformer</td><td>53.2</td><td>71.1</td><td>76.6</td><td>82.1</td><td>64.0</td><td>82.5</td><td>86.7</td><td>90.2</td></tr><tr><td>G2}Retro</td><td>54.1</td><td>74.1</td><td>81.2</td><td>86.7</td><td>63.1</td><td>84.2</td><td>88.5</td><td>91.7</td></tr><tr><td>PMSR</td><td>62.0</td><td>78.4</td><td>82.9</td><td>86.8</td><td>67.1</td><td>82.1</td><td>88.1</td><td>92.7</td></tr><tr><td>RetroExplainer</td><td>57.7</td><td>79.2</td><td>84.8</td><td>91.4</td><td>66.8</td><td>88.0</td><td>92.5</td><td>95.8</td></tr><tr><td rowspan="5">Data-driven</td><td>SCROP</td><td>43.7</td><td>60.0</td><td>65.2</td><td>68.7</td><td>59.0</td><td>74.8</td><td>78.1</td><td>81.1</td></tr><tr><td>Aug. Transformer</td><td>53.5</td><td>69.4</td><td>81.0</td><td>85.7</td><td></td><td>-</td><td>-</td><td>-</td></tr><tr><td>R-SMILES</td><td>56.3</td><td>79.2</td><td>86.2</td><td>91.0</td><td></td><td></td><td></td><td></td></tr><tr><td>Ualign</td><td>53.5</td><td>77.3</td><td>84.6</td><td>90.5</td><td>66.4</td><td>86.7</td><td>91.5</td><td>95.0</td></tr><tr><td>EditRetro</td><td>60.8</td><td>80.6</td><td>86.0</td><td>90.3</td><td></td><td></td><td></td><td></td></tr><tr><td>Ours</td><td>KnowRetro</td><td>62.7</td><td>82.1</td><td>88.1</td><td>92.7</td><td>71.6</td><td>90.2</td><td>93.9</td><td>96.8</td></tr></tbody></table></body></html></div>


settings. We further evaluate KnowRetro on the USPTO-FULL dataset, a larger and more diverse benchmark with a broader range of reaction types. Detailed statistics and results are provided in Appendix A.2 and Appendix B.6, respectively.



Evaluation Metrics. To effectively assess the performance of models, we employ three metrics: (1)Top-k Accuracy, measuring how often the ground truth reactants rank within the Top-k predictions $(k\in\{1,3,5,10\})$ )based on canonical SMILES comparison; (2) MaxFrag Accuracy (Tetko et al.,2020), inspired by classical retrosynthesis, which assesses the exact match of the largest fragment between predicted and ground truth reactants to address ambiguities in reagent reactions; (3) RoundTrip Accuracy (Schwaller et al., 2020),which assesses thechemical validity of predicted reactans by checking if a forward reaction model (Schwaller et al., 2019) can regenerate the original product. These metrics comprehensively assess prediction accuracy, fragment relevance, and chemical validity, with higher values indicating better performance. Details are provided in Appendix A.3.

Baselines. (1) Rule-based methods, which rely on predefined templates or similarity rules, including RetroSim (Coley et al., 2017), NeuralSym (Segler & Waller, 2017), GLN (Dai et all., 2019),LocalRetro (Chen & Jung, 2021), and RetroKNN (Xie et al., 2023). (2) Data-driven methods,which directly learn the mapping of products to reactants through end-to-end architectures, such as SCROP (Zheng et al.,2019), Aug.Transformer (Tetko et al., 2020), R-SMILES (Zhong et al, 2022),Ualign (Zeng et al., 2024), and EditRetro (Han et al., 2024).(3) Knowledge-enhanced methods,which incorporate auxiliary supervision from reaction-level annotations (e.g., reaction centers, synthons, or reaction types), represented by RetroXpert (Yan et al., 2020), G2Gs (Shi et all., 2020),MEGAN (Sacha et al., 2021), GraphRetro (Somnath et al., 2021), Retroformer (Wan et al, 2022),G²Retro (Chen et al., 2023), PMSR Jiang et al. (2023), and RetroExplainer (Wang et al., 2023).

### 4.2 COMPARISON WITH BASELINES (RQ1)

To address RQ1, we evaluate the KnowRetro on USPTO-50K, USPTO-FULL (Appendix B.6), different reaction types (Appendix B.3), and zero-shot settings (Appendix B.4).

Top-k Accuracy. As shown in Table 1, KnowRetro achieves 62.7% Top-1 accuracy in the classunknown scenario, surpassing RetroKNN (57.2%) and RetroExplainer (57.7%). These results validate that structural knowledge from unlabeled molecules provides a valuable signal for retrosynthesis and yields performance comparable to or exceeding rule- and knowledge-enhanced methods. In the class-known scenario, KnowRetro reaches 71.6% Top-1 accuracy, representing an improvement of about 4% over the strongest rule- and knowledge-enhanced baselines. Relative to EditRetro, the strongest data-driven baseline, KnowRetro shows consistent improvements, increasing Top-1 accu

racy by 1.9% and 4.6% in the unknown and known settings, respectively. Paired t-tests confirm that these improvements are statistically significant across all Top-k metrics (e.g.,.$\mathtt{p}=0.0012$ for Top-1and $p=\bar{0}.0005$ ifor Top-10), underscoring the effectiveness of the proposed framework.

MaxFrag and Round-Trip Accuracy.KnowRetro is further evaluated using the MaxFrag metric, which emphasizes chemical reasoning by focusing on primary reactants and addressing ambiguities in reagent reactions (Tetko et al., 2020).It achieves a Top-1 accuracy of 66.9%and a Top-10 accuracy of 94.1% on the USPTO-50K unknown dataset (see Table 2), demonstrating its superior performance in handling diverse and complex reaction scenarios. To further assess the practical utility of KnowRetro, we use the Round-Trip accuracy metric, which eval

<div style="text-align: center;">Table 2: Comparison of MaxFrag and Round-Trip Topk accuracy on USPTO-50K unknown. Baselines follow EditRetro (Han et al., 2024). </div>



<div style="text-align: center;"><html><body><table border="1"><tr><td>Metric</td><td>Model</td><td>k=1</td><td>k=3</td><td>k=5</td><td>k=10</td></tr><tr><td rowspan="5">MaxFrag</td><td>Aug. Transformer</td><td>58.5</td><td>73.0</td><td>85.4</td><td>90.0</td></tr><tr><td>MEGAN</td><td>54.2</td><td>75.7</td><td>83.1</td><td>89.2</td></tr><tr><td>R-SMILES</td><td>61.0</td><td>82.5</td><td>88.5</td><td>92.8</td></tr><tr><td>EditRetro</td><td>65.3</td><td>83.9</td><td>88.9</td><td>92.8</td></tr><tr><td>KnowRetro</td><td>66.9</td><td>84.5</td><td>89.9</td><td>94.1</td></tr><tr><td rowspan="4">Round-Trip</td><td>Graph2SMILES</td><td>76.7</td><td>56.0</td><td>46.4</td><td>34.9</td></tr><tr><td>Retroformer</td><td>78.9</td><td>72.0</td><td>67.1</td><td>57.2</td></tr><tr><td>EditRetro</td><td>83.4</td><td>73.6</td><td>65.3</td><td>50.8</td></tr><tr><td>KnowRetro</td><td>82.2</td><td>74.9</td><td>70.5</td><td>62.0</td></tr></table></body></html></div>


uates whether the predicted reactants can regenerate the target product via a forward reaction model (Schwaller et al., 2019). On the USPTO-50K unknown set, KnowRetro achieves 82.2% Top1 and 62.0% Top-10 accuracy, outperforming baselines on almost all metrics (Table 2). Notably,while EditRetro achieves the highest Top-1 (83.4%), likely due to self-distillation with forwardvalidated reactants, KnowRetro achieves more diverse and chemically valid predictions, as reflected in its superior Top-10 Round-Trip accuracy, making it better suited for practical retrosynthesis.

### 4.3 ABLATION STUDY (RQ2)

We perform ablations to assess the impact of each component in KnowRetro. Additional experiments on knowledge injection strategies (Appendix B.5) and the knowledge adapter (Appendix B.7)provide further insights into model design and reaction knowledge retention.

Effect of Pre-training and Hierarchical KG. (1) KnowRetro w/o KG & PT removes both the knowledge graph and pre-training modules, reducing the model to a vanilla Transformer. It achieves a Top-1 accuracy of 56.2%, similar to the Transformer-based R-SMILES (56.3%),showing that KnowRetro without external knowledge performs like a standard sequence model. (2) KnowRetro w/o KG adds the pre-training module.It improves the Top-10 accuracy from 90.7% to 

<div style="text-align: center;">Table 3: Ablation results on USPTO-50K (Unknown).</div>



<div style="text-align: center;"><html><body><table border="1"><tr><td>Model Variant</td><td>k=1</td><td>k=3</td><td>k=5</td><td>k=10</td></tr><tr><td>KnowRetro w/o KG & PT</td><td>56.2</td><td>78.9</td><td>85.7</td><td>90.7</td></tr><tr><td>KnowRetro w/o KG</td><td>57.8</td><td>80.6</td><td>86.8</td><td>92.3</td></tr><tr><td>KnowRetro w/o PT</td><td>60.4</td><td>81.3</td><td>87.3</td><td>92.2</td></tr><tr><td>KnowRetro w/ Mol</td><td>56.5</td><td>80.4</td><td>86.9</td><td>92.5</td></tr><tr><td>KnowRetro w/Mol+Sub</td><td>60.6</td><td>81.3</td><td>86.5</td><td>92.3</td></tr><tr><td>KnowRetro w/ Mol+Func</td><td>61.9</td><td>82.0</td><td>87.4</td><td>92.6</td></tr><tr><td>KnowRetro</td><td>62.7</td><td>82.1</td><td>88.1</td><td>92.7</td></tr></table></body></html></div>


92.3%, indicating that substructure-based pre-training helps the model learn chemical splitting patterns and disconnection strategies. (3) KnowRetro w/o PT keeps the hierarchical KG but removes pre-training. The Top-1 accuracy increases from 56.2% to 60.4%, showing that the KG provides useful chemical context through hierarchical structured relationships.

Effect of Hierarchical Knowledge Structure. To further examine how each level of structural knowledge contributes to retrosynthesis, we compare four KG variants. Using only molecule-level information (Mol), constructed from Morgan fingerprint similarity (Tanimoto > 0.5), results in the lowest Top-1 accuracy (56.5%), suggesting that coarse molecular similarity offers limited additional guidance for retrosynthesis. Using only substructures (Mol+Sub) or only functional groups (Mol+Func) leads to lower Top-1 accuracy (60.6% and 61.9%, respectively), indicating that each captures only part of the retrosynthetic context. The full KG (Mol+Sub+Func) achieves the best result (62.7%), highlighting the complementary roles of substructures in capturing disconnection patterns and functional groups in modeling reactivity. This result demonstrates that our hierarchical KG, learned from large-scale unlabeled molecular data, provides complementary multi-level chemical signals and offers clear benefits for guiding retrosynthesis.



### 4.4 FURTHER STUDY OF CHEMICAL KNOWLEDGE (RQ3)

Reliability of KnowRetro on Noisy KGs.KGs in practice may suffer from two types of perturbations: (i) structural perturbation, such as missing edges due to incomplete coverage, and (ii) semantic perturbation, such as mislabeled relations or functional group misannotations. To assess robustness, we simulate structural perturbation by randomly removing 15%,25%, and 35% of edges, and semantic perturbation by randomly corrupting relation types or entities. As shown in Figure 3, KnowRetro remains stable across both scenarios. For structural perturbation (Figure 3a), Top-1 accuracy decreases from 62.7% to 58.6% and Top-10 from 92.7% to 88.7%, corresponding to only a 6.5% relative drop in Top-1 accuracy under 35% edge removal. For semantic perturbation (Figure 3b), KnowRetro remains robust, with merely a 2.5% decline in Top1 accuracy under 35% corruption. These results demonstrate that KnowRetro is resilient to both incomplete and erroneous knowledge graphs, ensuring reliability in noisy real-world scenarios.



Diversity of Predicted Reactions. We assess the structural diversity of predicted reactants using multiple molecular similarity metrics, including Tanimoto similarity with Morgan fingerprints, MACCs keys, and Bemis–Murcko scaffolds. Following prior work (Han et al., 2024), we first compute Tanimoto similarity (Bajusz et al., 2015) with 2048-bit Morgan fingerprints, where lower values indicate higher diversity (details in Appendix A.4). As shown in Figure 4, 52.2% of test products fall into high-diversity groups (0.38–0.49),36.6% into medium (0.53–0.63), and only 

<div style="text-align: center;"><img src="https://pplines-online.bj.bcebos.com/deploy/official/paddleocr/general-layout-parsing-v3//9bb54f8f-1380-43f7-89a8-82320df3c796/markdown_3/imgs/img_in_chart_box_571_218_1007_505.jpg?authorization=bce-auth-v1%2FALTAKzReLNvew3ySINYJ0fuAMN%2F2026-03-23T18%3A06%3A43Z%2F-1%2F%2F7d9a390e3f14452bb709fa7491cec1cd49aa2186cc5d56f5cf8c92eb63bde2bc" alt="Image" width="35%" /></div>


<div style="text-align: center;">Figure 3: Robustness of KnowRetro on USPTO-50K under (a) structural and (b) semantic noise levels. Blue bars show Top-k accuracy; red lines indicate degradation, with smaller drops reflecting greater robustness.</div>


<div style="text-align: center;"><img src="https://pplines-online.bj.bcebos.com/deploy/official/paddleocr/general-layout-parsing-v3//9bb54f8f-1380-43f7-89a8-82320df3c796/markdown_3/imgs/img_in_chart_box_572_628_1002_977.jpg?authorization=bce-auth-v1%2FALTAKzReLNvew3ySINYJ0fuAMN%2F2026-03-23T18%3A06%3A43Z%2F-1%2F%2Fd401e5e82f57ae19a18f26033778f621fe02cb480c7fbd5b5a2ba32187b2abcc" alt="Image" width="35%" /></div>


<div style="text-align: center;">Figure 4: Cluster analysis of test product similarity distributions. Rows indicate clusters; columns denote similarity bins (0.0–1.0). Darker shades represent higher normalized frequencies. </div>


11.2% into low (≥0.65), showing that KnowRetro generates diverse reactants for most products.Compared with EditRetro, KnowRetro achieves lower average similarity (0.49 vs. 0.55), and results from MACCS keys and Bemis–Murcko scaffolds (Appendix B.10) further support its ability to generate diverse reactants while maintaining high prediction accuracy.

### 4.5 CASE STUDY 

Attention Analysis with Hierarchical Chemical Knowledge. To better illustrate how KnowRetro leverages structural knowledge, we compare the attention behaviors of KnowRetro and a variant without KG (Figure 5). The variant model shows diffuse patterns that mainly follow SMILES syntax and fail to emphasize the true reaction center. In contrast, KnowRetro consistently highlights the chemically meaningful disconnection site, such as the O–C cleavage in this example, and the fragment directly attached to it (e.g. the benzyl group). This joint attention on the disconnection site and its neighboring substructure indicates that the model captures transformation-relevant chemical context rather than relying on SMILES-pattern patterns. Such behavior demonstrates that the hierarchical knowledge learned from large-scale molecular data enables KnowRetro to make more 

<div style="text-align: center;"><img src="https://pplines-online.bj.bcebos.com/deploy/official/paddleocr/general-layout-parsing-v3//9bb54f8f-1380-43f7-89a8-82320df3c796/markdown_4/imgs/img_in_image_box_220_162_1004_454.jpg?authorization=bce-auth-v1%2FALTAKzReLNvew3ySINYJ0fuAMN%2F2026-03-23T18%3A06%3A46Z%2F-1%2F%2F9006a6cc576b7c50bcc0f5303e5e5b14302a1e45a520a22fcb9cbad730ad6844" alt="Image" width="64%" /></div>


<div style="text-align: center;">Figure 5: Attention patterns with and without hierarchical knowledge.</div>


<div style="text-align: center;"><img src="https://pplines-online.bj.bcebos.com/deploy/official/paddleocr/general-layout-parsing-v3//9bb54f8f-1380-43f7-89a8-82320df3c796/markdown_4/imgs/img_in_image_box_220_533_1001_771.jpg?authorization=bce-auth-v1%2FALTAKzReLNvew3ySINYJ0fuAMN%2F2026-03-23T18%3A06%3A46Z%2F-1%2F%2Fa01628f8806e42bfe6c92d9afbbfa4918a1783f2cf7a0e70fd5bd41488734ae7" alt="Image" width="63%" /></div>


<div style="text-align: center;">Figure 6: Multistep retrosynthesis generated by KnowRetro for Osimertinib (DB09330).</div>


accurate and chemically grounded disconnection decisions. Additional examples showing consistent behavior across different reaction types are provided in Appendix B.11.

Multistep Retrosynthesis Planning. To further evaluate the practical applicability of KnowRetro in real synthesis scenarios, we examine its multistep planning performance by iteratively applying the single-step model at each retrosynthetic stage. Figure 6 illustrates the retrosynthetic route generated by KnowRetro for Osimertinib (DB09330) (Finlay et al., 2014), a third-generation EGFR inhibitor widely used as a targeted anticancer drug. KnowRetro successfully recovers a chemically reasonable five-step route in which each predicted step closely matches known synthetic transformations. This demonstrates that the hierarchical knowledge learned from large-scale molecular data supports coherent, mechanism-consistent disconnections that extend naturally to multistep synthesis. A further example on Lenalidomide (DB00480) (Ponomaryov et al., 2015) is included in Appendix B.12.

## 5 CONCLUSION 

We presented KnowRetro, a knowledge-guided framework that leverages large-scale unlabeled molecular data for retrosynthesis prediction. By constructing a hierarchical chemical knowledge graph and integrating it through guided pre-training and knowledge-adaptive fine-tuning,KnowRetro captures transferable reaction patterns beyond annotated datasets. Extensive experiments demonstrate consistent gains in accuracy, robustness, and diversity over strong baselines.Beyond retrosynthesis, our work illustrates how structured knowledge from unlabeled data can be systematically incorporated into neural generation, suggesting a general paradigm for improving learning in data-scarce scientific domains. Future work will focus on enriching KnowRetro with quantum-chemical knowledge and experimental data, providing a more comprehensive foundation for knowledge-guided retrosynthesis.



## REFERENCES 

Alessandro Achille and Stefano Soatto. Emergence of invariance and disentanglement in deep representations. Journal of Machine Learning Research, 19(50):1–34, 2018.Dávid Bajusz, Anita Rácz, and Károly Héberger. Why is tanimoto index an appropriate choice for fingerprint-based similarity calculations? Journal of Cheminformatics, 7:1–13, 2015.David C Blakemore, Luis Castro, Ian Churcher, David C Rees, Andrew W Thomas, David M Wilson, and Anthony Wood. Organic synthesis provides opportunities to transform drug discovery.Nature Chemistry, 10(4):383–394, 2018.
Antoine Bordes, Nicolas Usunier, Alberto Garcia-Duran, Jason Weston, and Oksana Yakhnenko.Translating embeddings for modeling multi-relational data. Advances in Neural Information Processing Systems, 26, 2013.
Jonas Boström, Dean G Brown, Robert J Young, and Gyorgy M Keserü. Expanding the medicinal chemistry synthetic toolbox. Nature Reviews Drug Discovery, 17(10):709–727, 2018.Shuan Chen and Yousung Jung. Deep retrosynthetic reaction prediction using local reactivity and global attention. JACS Au, 1(10):1612–1620, 2021.
Ziqi Chen, Oluwatosin R Ayinde, James R Fuchs, Huan Sun, and Xia Ning. G 2 retro as a twostep graph generative models for retrosynthesis prediction. Communications Chemistry, 6(1):102, 2023.
Connor W Coley, Luke Rogers, William H Green, and Klavs F Jensen. Computer-assisted retrosynthesis based on molecular similarity. ACS Central Science, 3(12):1237–1245, 2017.EJ Corey and Xue-Min Cheng. The logic of chemical synthesis. John Wiley & Sons, 1989.Elias James Corey, Alan K Long, and Stewart D Rubenstein. Computer-assisted analysis in organic synthesis. Science, 228(4698):408–418, 1985.
Thomas M Cover. Elements of information theory. John Wiley & Sons, 1999.Hanjun Dai, Chengtao Li, Connor Coley, Bo Dai, and Le Song. Retrosynthesis prediction with conditional graph logic network. Advances in Neural Information Processing Systems, 32, 2019.Jorg Degen, Christof Wegscheid-Gerlach, Andrea Zaliani, and Matthias Rarey. On the art of compiling and using'drug-like'chemical fragment spaces. ChemMedChem, 3(10):1503, 2008.Yin Fang, Qiang Zhang, Haihong Yang, Xiang Zhuang, Shumin Deng, Wen Zhang, Ming Qin, Zhuo Chen, Xiaohui Fan, and Huajun Chen. Molecular contrastive learning with chemical element knowledge graph. In AAAI, volume 36, pp. 3968–3976, 2022.
M Raymond V Finlay, Mark Anderton, Susan Ashton, Peter Ballard, Paul A Bethel, Matthew R Box,Robert H Bradbury, Simon J Brown, Sam Butterworth, Andrew Campbell, et al. Discovery of a potent and selective egfr inhibitor (azd9291) of both sensitizing and t790m resistance mutations that spares the wild type form of the receptor, 2014.
Bartosz A Grzybowski, Sara Szymkuć, Ewa P Gajewska, Karol Molga, Piotr Dittwald, Agnieszka Wolos, and Tomasz Klucznik. Chematica: a story of computer code that started to think like a chemist. Chem, 4(3):390–398, 2018.
Yuqiang Han, Xiaoyang Xu, Chang-Yu Hsieh, Keyan Ding, Hongxia Xu, Renjun Xu, Tingjun Hou,Qiang Zhang, and Huajun Chen. Retrosynthesis prediction with an iterative string editing model.Nature Communications, 15(1):6404, 2024.
John R Hershey and Peder A Olsen. Approximating the kullback leibler divergence between gaussian mixture models. In 2007 IEEE International Conference on Acoustics, Speech and Signal Processing-ICASSP'07, volume 4, pp. IV–317. IEEE, 2007.


Yinjie Jiang, WEI Ying, Fei Wu, Zhengxing Huang, Kun Kuang, and Zhihua Wang. Learning chemical rules of retrosynthesis with pre-training. In Proceedings of the AAAI Conference on Artificial Intelligence, volume 37, pp. 5113–5121, 2023.
Wengong Jin, Connor Coley, Regina Barzilay, and Tommi Jaakkola. Predicting organic reaction outcomes with weisfeiler-lehman network. Advances in Neural Information Processing Systems,30, 2017.
Pavel Karpov, Guillaume Godin, and Igor V Tetko. A transformer model for retrosynthesis. In ICANN, pp. 817–830. Springer, 2019.
Diederik P Kingma, Max Welling, et al. Auto-encoding variational bayes, 2013.Greg Landrum et al. Rdkit: A software suite for cheminformatics, computational chemistry, and predictive modeling. Greg Landrum, 8(31.10):5281, 2013.
Xuan Lin, Zhe Quan, Zhi-Jie Wang, Tengfei Ma, and Xiangxiang Zeng. Kgnn: Knowledge graph neural network for drug-drug interaction prediction. In IJCAI, volume 380, pp. 2739–2745, 2020.Daniel Mark Lowe. Extraction of chemical structures and reactions from the literature. PhD thesis,University of Cambridge, 2012.
Tengfei Ma, Yujie Chen, Liang Wang, Xuan Lin, Bosheng Song, and Xiangxiang Zeng. S2dn:Learning to denoise unconvincing knowledge for inductive knowledge graph completion. In Proceedings of the AAAI Conference on Artificial Intelligence, volume 39, pp.12355–12363, 2025.Xiaoqin Pan, Xuan Lin, Dongsheng Cao, Xiangxiang Zeng, Philip S Yu, Lifang He, Ruth Nussinov,and Feixiong Cheng. Deep learning for drug repurposing: Methods, databases, and applications.Wiley Interdisciplinary Reviews: Computational Molecular Science, 12(4):e1597, 2022.Yuri Ponomaryov, Valeria Krasikova, Anton Lebedev, Dmitri Chernyak, Larisa Varacheva, and Alexandr Chernobroviy. Scalable and green process for the synthesis of anticancer drug lenalidomide. Chemistry of Heterocyclic Compounds, 51(2):133–138, 2015.Mikołaj Sacha, Mikolaj Błaz, Piotr Byrski, Pawel Dabrowski-Tumanski, Mikołaj Chrominski, Rafal Loska, Pawel Wlodarczyk-Pruszynski, and Stanislaw Jastrzebski. Molecule edit graph attention network: modeling chemical reactions as sequences of graph edits. Journal of Chemical Information and Modeling, 61(7):3273–3284, 2021.
Michael Schlichtkrull, Thomas N Kipf, Peter Bloem, Rianne Van Den Berg, Ivan Titov, and Max Welling. Modeling relational data with graph convolutional networks. In ESWC, pp. 593–607.Springer, 2018.
Philippe Schwaller, Teodoro Laino, Théophile Gaudin, Peter Bolgar, Christopher A Hunter, Costas Bekas, and Alpha A Lee. Molecular transformer: a model for uncertainty-calibrated chemical reaction prediction. ACS Central Science, 5(9):1572–1583, 2019.
Philippe Schwaller, Riccardo Petraglia, Valerio Zullo, Vishnu H Nair, Rico Andreas Haeuselmann,Riccardo Pisoni, Costas Bekas, Anna Iuliano, and Teodoro Laino. Predicting retrosynthetic pathways using transformer-based models and a hyper-graph exploration strategy. Chemical Science,11(12):3316–3325, 2020.
Marwin HS Segler and Mark P Waller. Neural-symbolic machine learning for retrosynthesis and reaction prediction. Chemistry–A European Journal, 23(25):596–5971, 2017.Chence Shi, Minkai Xu, Hongyu Guo, Ming Zhang, and Jian Tang. A graph to graphs framework for retrosynthesis prediction. In ICML, pp. 8818–8827. PMLR, 2020.Vignesh Ram Somnath, Charlotte Bunne, Connor Coley, Andreas Krause, and Regina Barzilay.Learning graph models for retrosynthesis prediction. Advances in Neural Information Processing Systems,34:9405–9415, 2021.
Teague Sterling and John J Irwin. Zinc 15–ligand discovery for everyone. Journal of Chemical Information and Modeling, 55(11):2324–2337, 2015.


Qingyun Sun, Jianxin Li, Hao Peng, Jia Wu, Xingcheng Fu, Cheng Ji, and Philip S Yu. Graph structure learning with variational information bottleneck. In Proceedings of the AAAI conference on artificial intelligence, volume 36, pp. 4165–4174, 2022.
Zhiqing Sun, Zhi-Hong Deng, Jian-Yun Nie, and Jian Tang. Rotate: Knowledge graph embedding by relational rotation in complex space. arXiv preprint arXiv:1902.10197, 2019.Sara Szymkuć, Ewa P Gajewska, Tomasz Klucznik, Karol Molga, Piotr Dittwald, Michal Startek,Michal Bajczyk, and Bartosz A Grzybowski. Computer-assisted synthetic planning: the end of the beginning. Angewandte Chemie International Edition, 55(20):5904–5937, 2016.Igor V Tetko, Pavel Karpov, Ruud Van Deursen, and Guillaume Godin. State-of-the-art augmented nlp transformer models for direct and single-step retrosynthesis. Nature Communications, 11(1):5575, 2020.
Zhengkai Tu and Connor W Coley. Permutation invariant graph-to-sequence model for templatefree retrosynthesis and reaction prediction. Journal of Chemical Information and Modeling, 62(15):3503–3513, 2022.
Yue Wan, Chang-Yu Hsieh, Ben Liao, and Shengyu Zhang. Retroformer: Pushing the limits of end-to-end retrosynthesis transformer. In ICML, pp. 22475–22490. PMLR, 2022.Xiaorui Wang, Yuquan Li, Jiezhong Qiu, Guangyong Chen, Huanxiang Liu, Benben Liao, ChangYu Hsieh, and Xiaojun Yao. Retroprime: A diverse, plausible and transformer-based method for single-step retrosynthesis predictions. Chemical Engineering Journal, 420:129845, 2021.Yu Wang, Chao Pang, Yuzhe Wang, Junru Jin, Jingjie Zhang, Xiangxiang Zeng, Ran Su, Quan Zou,and Leyi Wei. Retrosynthesis prediction with an interpretable deep-learning framework based on molecular assembly tasks. Nature Communications, 14(1):6155, 2023.Jiancong Xie, Yi Wang, Jiahua Rao, Shuangjia Zheng, and Yuedong Yang. Self-supervised contrastive molecular representation learning with a chemical synthesis knowledge graph. Journal of Chemical Information and Modeling, 64(6):1945–1954, 2024.
Shufang Xie, Rui Yan, Junliang Guo, Yingce Xia, Lijun Wu, and Tao Qin. Retrosynthesis prediction with local template retrieval. In AAAI, volume 37, pp. 5330–5338, 2023.Chaochao Yan, Qianggang Ding, Peilin Zhao, Shuangjia Zheng, Jinyu Yang, Yang Yu, and Junzhou Huang. Retroxpert: Decompose retrosynthesis prediction like a chemist. Advances in Neural Information Processing Systems, 33:11248–11258, 2020.
Bishan Yang, Wen-tau Yih, Xiaodong He, Jianfeng Gao, and Li Deng. Embedding entities and relations for learning and inference in knowledge bases. arXiv preprint arXiv:1412.6575, 2014.Kaipeng Zeng, Bo Yang, Xin Zhao, Yu Zhang, Fan Nie, Xiaokang Yang, Yaohui Jin, and Yanyan Xu. Ualign: pushing the limit of template-free retrosynthesis prediction with unsupervised smiles alignment. Journal of Cheminformatics, 16(1):80, 2024.
Xiangxiang Zeng, Hongxin Xiang, Linhui Yu, Jianmin Wang, Kenli Li, Ruth Nussinov, and Feixiong Cheng. Accurate prediction of molecular properties and drug targets using a self-supervised image representation learning framework. Nature Machine Intelligence, 4(11):1004–1016, 2022.Zaixi Zhang, Qi Liu, Hao Wang, Chengqiang Lu, and Chee-Kong Lee. Motif-based graph selfsupervised learning for molecular property prediction. Advances in Neural Information Processing Systems, 34:15870–15882, 2021.
Peng-Cheng Zhao, Xue-Xin Wei, Qiong Wang, Qi-Hao Wang, Jia-Ning Li, Jie Shang, Cheng Lu,and Jian-Yu Shi. Single-step retrosynthesis prediction via multitask graph representation learning.Nature Communications, 16(1):814, 2025.
Shuangjia Zheng, Jiahua Rao, Zhongyue Zhang, Jun Xu, and Yuedong Yang. Predicting retrosynthetic reactions using self-corrected transformer neural networks. Journal of Chemical Information and Modeling, 60(1):47–55, 2019.


## APPENDIX 

A Implementation details 15  
A.1 Hyper-parameter settings .15  
A.2 Datasets .15  
A.3Detailed explanation of evaluation metrics 15  
A.4Details on reaction diversity analysis.16  
B Additional Experiments 16  
B.1Effect of Data augmentation 16  
B.2Performance evaluation of different KG algorithms 17  
B.3Performance across different reaction types 18  
B.4Zero-shot performance on functional group interconversion 18  
B.5Effect of knowledge injection strategies 18  
B.6Performance on the USPTO-FULL dataset.19  
B.7Effectiveness of the Task-Relevant Knowledge Adapter 19  
B.8Analysis of the Variational Bottleneck Parameter β20  
B.9 Analysis of the impact of the pre-training strategy .20  
B.10 Additional Analyses of Reaction Diversity . . .20  
B.11 Attention Analysis with Hierarchical Knowledge.21  
B.12 Additional case of MultiStep Planning . .21  
C Proof 22  
C.1 Proof of Lemma 1 (Task-relevant Knowledge Extraction) .22  
D LLM Usage 22

## A IMPLEMENTATION DETAILS 

### A.1 HYPER-PARAMETER SETTINGS 

The KnowRetro framework combines a relational graph encoder with a Transformer-based generation module to jointly model hierarchical chemical knowledge and retrosynthetic sequence prediction. The graph encoder employs a 2-layer RGCN with 256-dimensional node embeddings to encode multi-relational chemical semantics. To improve scalability, we adopt global edge sampling with 30,000 edges per subgraph and apply dropout with a rate of 0.2. Negative samples are constructed by randomly corrupting either the head or tail entity in knowledge triples at a 16:1 ratio.Parameters are initialized using a uniform distribution $\begin{array}{r}{U\left[-\frac{6}{\sqrt{d}},\frac{6}{\sqrt{d}}\right]}\end{array}$ , with $d=256$ i. Gradient clipping with a maximum norm of 1.0 is applied to stabilize training. The sequence generator is an 8-layer Transformer with 256 hidden dimensions and 8 attention heads in both encoder and decoder.Optimization uses Adam with a Noam learning rate schedule (8000 warm-up steps) and 0.3 dropout.The variational bottleneck parameter is set to $\beta=0.03$ , which provides the best trade-off between accuracy and regularization (see Appendix B.8 for a sensitivity analysis). Pre-training is conducted for 2 million steps with a batch size of 128, followed by fine-tuning for 400.000 steps with a batch size of 64. All experiments were repeated 10 times with different random seeds to ensure statistical robustness. The USPTO-50K dataset is augmented 20x following (Zhong et al., 2022), and the model is trained for 24 hours on a single NVIDIA GeForce RTX 3090 GPU with 24GB memory.See AppendixB.1 for augmentation details.



### A.2 DATASETS 

We evaluate on two USPTO-derived benchmarks. The USPTO-50K dataset (Coley et al., 2017) contains 50,016 atom-mapped reactions across 10 classes with a standard 40K/5K/5K train/validation/test split, and is evaluated under both Known (reaction class provided)and Unknown (without reaction class labels) settings.The USPTO-FULL dataset (Dai et al., 2019; Lowe,2012) consists of 950.000 cleaned reactions extracted 

<div style="text-align: center;">Table 4: Statistics of node in the KG.</div>



<div style="text-align: center;"><html><body><table border="1"><tr><td>Node Type</td><td>Count</td></tr><tr><td>Molecule</td><td>1,353,930</td></tr><tr><td>Substructure</td><td>414,640</td></tr><tr><td>Functional Group</td><td>964</td></tr></table></body></html></div>


from U.S. patents (1976–2016), where multi-product reactions are separated into single-product entries and the data is split into 80%/10%/10% for training, validation, and testing. For knowledge graph construction, we use only molecular structures from USPTO-50K, USPTO-MIT, and USPTOFULL, together with 250K additional molecules sampled from ZINC15 (Sterling & Irwin, 2015;Zhang et all., 2021). Each molecule is decomposed into BRICS-based substructures and SMARTSdefined functional groups, while ractio-level information(e.g., reactantproduct pairs or labels) is not used. All molecules are canonicalized and deduplicated prior to graph construction. The resulting hierarchical KG encodes relationships among molecules, substructures, and functional groups,and contains 1,769,534 entities and 15,406,980 triples connected by seven relation types. Table 4reports the node statistics. The reported performance of baselines is from the original papers for comparison.



### A.3 DETAILED EXPLANATION OF EVALUATION METRICS 

To comprehensively evaluate the performance of KnowRetro, we introduce three key metrics: Top-k Accuracy, MaxFrag Accuracy, and Round-Trip Accuracy. The details are as follows:

Top-k Accuracy. Top-k Accuracy evaluates the ability of the model to rank the ground truth reactants among its top-k predictions. The metric is defined as:

$$\operatorname{T o p-}k\operatorname{A c c u r a c y}=\frac{1}{N}\sum_{i=1}^{N}\mathbb{I}\left[Y_{\operatorname{t r u e}}\in\{Y_{i}^{j}\mid j=1,\ldots,k\}\right],$$

where N is the total number of test products,$Y_{\mathrm{t r u e}}$ represents the ground truth reactants for the ith product,$Y_{i}^{j}$ denotes the j-th predicted reactant set for the i-th product, and I[⋅] is the indicator function that returns 1 if the ground truth reactants appear in the top-k predictions, and 0 otherwise.

This metric evaluates the model's recall, focusing on its ability to retrieve the correct reactants from a limited set of predictions.



MaxFrag Accuracy. MaxFrag Accuracy, inspired by classical retrosynthesis (Tetko et al., 2020),evaluates the exact match of the largest reactant fragment between predicted and ground truth reactants, specifically addressing ambiguities in reagent selection. The calculation involves canonicalizing the reactant SMILES strings, removing atom mapping numbers, and spliting the SMILES string by the dot (.) to identify individual fragments. The largest fragment is determined based on atom count, The metric is defined as:

$$\operatorname{M a x F r a g}(k)=\frac{1}{N}\sum_{i=1}^{N}\mathbb{I}\left[f(Y_{\mathsf{t r u e}})\in\{f(Y_{i}^{j})\mid j=1,\ldots,k\}\right],$$

where N denotes the total number of test cases,$Y_{\mathsf{t r u e}}$ :represents the ground truth reactants for the i-th product,$Y_{i}^{j}$ refers to the j-th predicted reactant set for the i-th product,$f(\cdot)$ is a function extracting the largest fragment by atom count, and I[⋅] is an indicator function that returns 1 if the largest fragment of the ground truth reactants matches any of the top-k predicted reactants and 0otherwise. This metric focuses on the primary reactive component, ensuring a robust evaluation of retrosynthesis performance, particularly under scenarios with ambiguous reagents.

Round-Trip Accuracy. Round-Trip Accuracy(Schwaller et al., 2020) measures the feassibility of predicted reactants by verifying whether the original product can be regenerated using a forward reaction model (e.g., Molecular Transformer (Schwaller et al., 2019)). For Top-k predictions, the metric is computed as:

$$\operatorname{R o u n d T r i p}(k)=\frac{1}{N\cdot k}\sum_{i=1}^{N}\sum_{j=1}^{k}\mathbb{I}\left[\operatorname{M a t c h}\operatorname{P r o d u c t}\right],$$

where N is the total number of test products, k represents the number of top predictions considered,and $\mathbb{I}[\cdot]$ is an indicator function that returns 1 if the forward reaction model successfully reproduces the original product from the predicted reactants, and 0 otherwise. By emphasizing chemical validity and practical feasibility, this metric complements Top-k Accuracy by providing an additional evaluation criterion for retrosynthesis predictions.



### A.4 DETAILS ON REACTION DIVERSITY ANALYSIS 

To assess the structural diversity of predicted reactions, we calculated pairwise Tanimoto similarities among the top-10 predicted reactants for each product and clustered the products based on their reaction similarity distributions (Chen et al., 2023). Algorithm 1 outlines the workflow, including similarity computation and clustering. The pairwise reaction similarities, as detailed in the fourth line of the algorithm, are computed in the following scenarios: (1) One-to-One: When both reactant sets contain a single reactant, the Tanimoto similarity (Bajusz et al., 2015) is calculated by comparing their molecular fingerprints. The similarity measures the overlap between the two sets of fingerprints. (2) One-to-Multiple: If one reactant set contains a single reactant and the other contains multiple reactants, the molecular fingerprints of the multi-reactant set are combined using a bitwise OR operation. The Tanimoto similarity is then computed between the merged fingerprint of the multi-reactant set and the fingerprint of the single reactant. (3) Multiple-to-Multiple: For scenarios where both reactant sets contain multiple reactants, we focus on cases with exactly two reactants in each set. The pairwise similarity is calculated by comparing each reactant in one set to each reactant in the other set, then averaging the highest similarity values.

## B ADDITIONAL EXPERIMENTS 

### B.1 EFFECT OF DATA AUGMENTATION 

We follow the data augmentation strategy proposed in previous works (Zhong et al., 2022), where augmentation is applied both during training and testing. Specifically, we perform 20x data augmentation for both the training and test sets of the USPTO-50K dataset. During training, we generate multiple input-output pairs by enumerating different atoms as the root of the SMILES string, thereby 

Algorithm 1 Workflow for Reaction Diversity Calculation 
Input: Setof Kproducts with their top-10predicted reactant sets {Xk,{Yk}i=1,.,10}k=1,.…,K,
and the number of clusters NClusters.

Output:Clusterofpoduct{Ci}1,NCtbaseoeactiosimlitdistribu
tions.

1: for k = 1 to K do 

2:Initializethetof parwisesimlities {im}orproduct Xk.
3:for each pair of reactions (Y k, Y k) where i (= j do 
4:Compute similaity: simj = TnimotoY,Y k).

5:end for 

6:Generate the reaction similarity distribution for product Xk as a histogram: hk =
Histogram({simkj}).

7:Normalize the histogram: hk = hk/ ∑ hk.

8: end for 

9: Apply K-Means clustering to the set of normalized histograms{hk}k=1,…,: {Ci} =
K-Means({hk}, NClusters)

10: for i = 1 to NClusters do 

11:Compute  the average  reaction  similarity for  cluster Ci:  simi =
|Ci 1∑k∈Ci Average({simj}).

12: end for 

13: Sort clusters {Ci} in ascending order of average similarity sim (lower sim indicates higher 
diversity).

14:{1,ito)

increasing the diversity of training examples and improving model generalization. During inference,multiple SMILES variants of the same molecule are used to generate diverse predictions, which are uniformly scored and aggregated by top-K selection.



Applying 20× training augmentation alone already improves KnowRetro's Top-1 accuracy from 57.1% to 60.4%, , while R-SMILES improves from 40.9% to 51.2% under the same setting. We then further evaluated the effect of test-time augmentation, as presented in Table 5.For R-SMILES, Top-1 accuracy improved from 51.2% to 56.3%,and Top-10 accuracy increased from 83.0% to 91.0%. KnowRetro exhibited similar gains, with Top-1 accuracy rising from 60.4% to 62.7%, and Top-10 accuracy 

<div style="text-align: center;">Table 5: Comparison of Top-k performance with and without data augmentation during testing.*indicates augmented versions. </div>



<div style="text-align: center;"><html><body><table border="1"><tr><td colspan="6"></td></tr><tr><td>Model</td><td>$k{=}1$</td><td>$k{=}3$</td><td>$k{=}5$</td><td>| $k{=}10$</td><td></td></tr><tr><td>R-SMILES</td><td>51.2</td><td>75.1</td><td>81.1</td><td>83.0</td><td></td></tr><tr><td>R-SMILES*</td><td>56.3</td><td>79.2</td><td>86.2</td><td>91.0</td><td></td></tr><tr><td>KnowRetro</td><td>60.4</td><td>80.5</td><td>85.7</td><td>91.2</td><td>KnowRetro*</td></tr></table></body></html></div>


increasing from 91.2% to 92.7% with augmentation (KnowRetro*). These results demonstrate that data augmentation consistently enhances performance. Notably, even without any test augmentation,the models still performed robustly, with KnowRetro achieving 60.4% Top-1 and 91.2% Top-10 accuracy. The model demonstrates strong performance and adaptability in multi-step inference, with data augmentation offering significant improvements while maintaining strong accuracy without it.

### B.2 PERFORMANCE EVALUATION OF DIFFERENT KG ALGORITHMS 

To further validate the effectiveness of incorporating hierarchical chemical knowledge into retrosynthesis, we conducted experiments by integrating several commonly used knowledge graph representation methods into our framework. Specifically, we equip KnowRetro with TransE (Bordes et al., 2013), RotatE (Sun et al.,2019), and RGCN (Schlichtkrull et al., 2018) to evaluate whether the integration of diverse KG 

<div style="text-align: center;">Table 6: Top-k accuracy under different KG designs. </div>



<div style="text-align: center;"><html><body><table border="1"><tr><td></td><td colspan="4"></td></tr><tr><td>Model</td><td>k=1</td><td>$k{=}3$</td><td>$k{=}5$</td><td>$k{=}10$</td></tr><tr><td>R-SMILES</td><td>56.3</td><td>79.2</td><td>86.2</td><td>91.0</td></tr><tr><td>KnowRetro-TransE</td><td>61.7</td><td>80.0</td><td>86.9</td><td>91.3</td></tr><tr><td>KnowRetro-RotatE KnowRetro-RGCN</td><td>64.5 62.7</td><td>82.4 82.1</td><td>88.0 88.1</td><td>92.2</td></tr></table></body></html></div>


techniques could consistently enhance performance. The results, presented in Table 6, demonstrate 

that all KG-based methods significantly outperform the baseline R-SMILES across various Top-k metrics. Notably, KnowRetro-RGCN achieves the highest Top-5 and Top-10 accuracies (88.1%and 92.7%, respectively), while KnowRetro-RotatE achieves the best Top-1 performance at 64.5%.These consistent improvements across different KG representation methods demonstrate the effectiveness and robustness of our knowledge-guided approach. Notably, although RotatE performs slightly better on Top-1, we adopt RGCN as the default encoder due to its inductive nature and stronger generalization to unseen molecular entities.



### B.3 PERFORMANCE ACROSS DIFFERENT REACTION TYPES 

To evaluate the model's performance across different reaction types, we compared various variants of KnowRetro, including RGCN,TransE, and RotatE, with R-SMILES (Zhong et al., 2022) and G²Retro (Chen et al., 2023). RSMILES learns reaction transformations by analyzing input-output SMILES similarity, while G2Retro uses reaction center prediction to model chemical rules. As shown in Figure 7, the RGCN, TransE, and RotatE variants of KnowRetro outperform R-SMILES and G²Retro in 7 out of 10 reaction types, with one type achieving identical performance. This demonstrates the advantage of integrating hierarchical chemical knowledge into the model.By leveraging structured external knowledge,

KnowRetro enhances its adaptability and accuracy across a wide range of reaction types.

<div style="text-align: center;"><img src="https://pplines-online.bj.bcebos.com/deploy/official/paddleocr/general-layout-parsing-v3//a8de4738-841c-461f-87fc-c1b4dd879bf1/markdown_2/imgs/img_in_image_box_613_404_998_663.jpg?authorization=bce-auth-v1%2FALTAKzReLNvew3ySINYJ0fuAMN%2F2026-03-23T18%3A06%3A40Z%2F-1%2F%2F8c54d0622e34a78eeca18b859f3108acc453b8322a8714cd6ebdef6e6673a061" alt="Image" width="31%" /></div>


<div style="text-align: center;">Figure 7: Top-1 accuracy of KnowRetro (and variants) vs. baselines across reaction types.</div>


### B.4 ZERO-SHOT PERFORMANCE ON FUNCTIONAL GROUP INTERCONVERSION 

To assess the knowledge graph's ability to generalize to unseen reaction types, we conducted a zero-shot experiment by removing the Functional Group Interconversion reaction class (type 9) from the training and validation sets, leaving it in the test set. This setup allows evaluation of the KG's role in capturing unseen reaction classes. As shown in Table 7,KnowRetro, which integrates the KG, achieves a significantly higher Top-1 accuracy of 9.4%compared to models without the KG, such as 

<div style="text-align: center;">Table 7: Zero-shot performance on Functional Group Interconversion (Type 9), comparing Top-k accuracy (no test augmentation) with and without KG utilization. </div>



<div style="text-align: center;"><html><body><table border="1"><tr><td>Model</td><td>k=1</td><td>$k{=}3$</td><td>$k{=}5$</td><td>k=10</td></tr><tr><td>KnowRetro w/o KG & PT</td><td>5.9</td><td>7.6</td><td>9.7</td><td>12.5</td></tr><tr><td>KnowRetro w/o KG</td><td>6.5</td><td>9.8</td><td>10.3</td><td>12.5</td></tr><tr><td>KnowRetro w/o PT</td><td>7.8</td><td>13.2</td><td>16.4</td><td>20.2</td></tr><tr><td>KnowRetro</td><td>9.4</td><td>14.2</td><td>16.8</td><td>20.8</td></tr></table></body></html></div>


KnowRetro w/o KG (6.5%) and KnowRetro w/o KG & PT (5.9%). Similarly, in Top-10 accuracy,KnowRetro achieves 20.8%, outperforming KnowRetro w/o KG (12.5%) and KnowRetro w/o KG &PT (12.5%). Furthermore, when compared to RetroKNN (Xie et al., 2023), as presented in Figures 4a and 4c of the RetroKNN paper, RetroKNN shows comparatively lower performance on type 9 in zero-shot scenarios, with Top-5 accuracy around 8.5% and Top-10 accuracy around 12.5%. These results highlight the critical role of the KG in enabling KnowRetro to capture hierarchical chemical relationships, thereby enhancing its performance in zero-shot scenarios.

### B.5 EFFECT OF KNOWLEDGE INJECTION STRATEGIES 

We study the impact of different knowledge injection strategies in KnowRetro by comparing three configurations: (i) encoder-only injection, (ii) decoder-only injection, and (iii) combined encoder-decoder injection. These strategies determine where the distilled KG embedding.$\mathbf{z}_{\mathrm{p r o d u c t}}$ is fused into the generative model.

<div style="text-align: center;">Table 8: Effect of knowledge injection strategies.</div>



<div style="text-align: center;"><html><body><table border="1"><tr><td colspan="6"></td></tr><tr><td>Injection Strategy</td><td>$k{=}1$</td><td>$k{=}3$</td><td>$k{=}5$</td><td>$k{=}10$</td></tr><tr><td>Encoder-only</td><td>61.4</td><td>81.6</td><td>87.5</td><td>92.4</td></tr><tr><td>Decoder-only Enc–Dec (Ours)</td><td>60.9 62.7</td><td>81.4 82.1</td><td>87.0</td><td>92.2 92.7</td></tr></table></body></html></div>


As shown in Table 8, injecting knowledge into the encoder yields better results than decoder-only injection, indicating that early conditioning helps the model better understand chemical structures.Decoder-only injection also improves accuracy by guiding generation with reaction-aware context.The encoder–decoder configuration achieves the best performance, confirming that injecting knowledge into both stages allows the model to more effectively utilize hierarchical chemical information.These results highlight the complementary roles of encoder and decoder injection, demonstrating that joint conditioning at both levels is essential for improving retrosynthesis prediction.

### B.6 PERFORMANCE ON THE USPTO-FULL DATASET 

that hierarchical knowledge extracted from unlabeled molecules enables robust generalization across large-scale and diverse reaction spaces.



To evaluate the scalability and generalization of KnowRetro, we conducted experiments on the USPTO-FULL dataset (Dai et al., 2019), a benchmark significantly larger and more diverse than USPTO-50K. This dataset contains approximately 950,000 reactions spanning a wide range of reaction types, with 80% allocated for training,10% for validation, and 10% for testing, making it an ideal benchmark for assessing the robustness of KnowRetro across diverse reaction datasets.To ensure fair comparison, KnowRetro is trained on a 5× augmented USPTO-FULL dataset, following the setup of R-SMILES (Zhong et al,2022) and EditRetro (Han et al., 2024), while all other baselines use their original settings.As shown in Table 9, KnowRetro achieves the best overall performance, with 56.2% Top-1 and 80.1% Top-10 accuracy. These results highlight its clear advantage over existing rule-based, taskguided, and data-driven methods, demonstrating 

<div style="text-align: center;">Table 9: Top-k accuracy (%) on USPTO-FULL dataset. "-" denotes results not reported.</div>



<div style="text-align: center;"><html><body><table border="1"><tr><td colspan="5"></td></tr><tr><td>Model</td><td>$k{=}1$</td><td>$k{=}3$</td><td>$k{=}5$</td><td>$k{=}10$</td></tr><tr><td>RetroSim</td><td>32.8</td><td>一</td><td>一</td><td>56.1</td></tr><tr><td>NeuralSym</td><td>35.8</td><td>一</td><td>一</td><td>60.8</td></tr><tr><td>GLN</td><td>39.3</td><td></td><td></td><td>63.7</td></tr><tr><td>LocalRetro</td><td>39.1</td><td>53.3</td><td>58.4</td><td>63.7</td></tr><tr><td>RetroXpert</td><td>49.4</td><td>63.6</td><td>67.6</td><td>71.6</td></tr><tr><td>RetroPrime</td><td>44.1</td><td></td><td></td><td>68.5</td></tr><tr><td>RetroExplainer</td><td>51.4</td><td>70.7</td><td>74.7</td><td>79.2</td></tr><tr><td>Aug. Transformer MEGAN</td><td>46.2 33.6</td><td>一</td><td>一</td><td>73.3</td></tr><tr><td>1</td><td>63.9</td><td></td><td></td><td></td></tr><tr><td>Graph2Edits</td><td>44.0</td><td>60.9</td><td>66.8</td><td>72.5</td></tr><tr><td>R-SMILES</td><td>48.9</td><td>66.6</td><td>72.0 65.5</td><td>76.4</td></tr><tr><td>Ualign</td><td>50.4</td><td>66.1</td><td>71.3</td><td>76.2</td></tr><tr><td>EditRetro</td><td>52.2</td><td>67.1</td><td>71.6</td><td>74.2</td></tr><tr><td>KnowRetro</td><td>56.2</td><td>71.4</td><td>75.7</td><td>80.1</td></tr></table></body></html></div>


Beyond Top-k accuracy, we further evaluate KnowRetro on USPTO-FULL using MaxFrag and Round-Trip metrics. As shown in Table 10,KnowRetro consistently surpasses EditRetro,achieving higher MaxFrag accuracy, which reflects more reliable alignment with major product fragments, and substantially higher RoundTrip accuracy, indicating chemically valid and reversible predictions. In addition, diversity analysis (Table 11) shows that KnowRetro generates a markedly larger proportion of highdiversity predictions, underscoring its stronger capacity to explore alternative disconnection strategies. These results demonstrate that KnowRetro generalizes robustly to large and di

<div style="text-align: center;">Table 10: Comparison on USPTO-FULL with respect to MaxFrag and RoundTrip accuracy.</div>



<div style="text-align: center;"><html><body><table border="1"><tr><td rowspan="2">Metrics</td><td colspan="2">MaxFrag</td><td colspan="2">RoundTrip</td></tr><tr><td>EditRetro</td><td>KnowRetro</td><td>EditRetro</td><td>KnowRetro</td></tr></thead><tbody><tr><td>Top-1</td><td>59.9</td><td>64.6</td><td>75.7</td><td>76.1</td></tr><tr><td>Top-3</td><td>72.2</td><td>78.0</td><td>55.1</td><td>64.3</td></tr><tr><td>Top-5</td><td>75.3</td><td>81.7</td><td>43.8</td><td>58.1</td></tr><tr><td>Top-10</td><td>78.2</td><td>85.4</td><td>31.0</td><td>50.0</td></tr></table></body></html></div>


<div style="text-align: center;">Table 11: Diversity on USPTO-FULL.</div>



<div style="text-align: center;"><html><body><table border="1"><tr><td>Diversity Level</td><td>EditRetro (%)</td><td>KnowRetro (%)</td></tr><tr><td>High Diversity</td><td>33.0</td><td>51.0</td></tr><tr><td>Medium Diversity</td><td>45.0</td><td>20.5</td></tr><tr><td>Low Diversity</td><td>22.0</td><td>28.5</td></tr></table></body></html></div>


verse benchmarks while delivering accurate and diverse predictions.

### B.7 EFFECTIVENESS OF THE TASK-RELEVANT KNOWLEDGE ADAPTER 

To evaluate the contribution of the task-relevant knowledge adapter, we conducted a controlled experiment by removing this module and directly injecting the raw KG embeddings into the encoder and decoder (denoted as KnowRetro w/o Adapter). As shown in Table 12, removing the Knowledge Adapter results in consistent 

<div style="text-align: center;">Table 12: Impact of the Knowledge Adapter on USPTO-50K (Unknown). </div>



<div style="text-align: center;"><html><body><table border="1"><tr><td>Model Variant</td><td>k=1</td><td>k=3</td><td>k=5</td><td>k=10</td></tr><tr><td>KnowRetro w/o Adapter</td><td>61.5</td><td>81.4</td><td>87.5</td><td>92.2</td></tr><tr><td>KnowRetro</td><td>62.7</td><td>82.1</td><td>88.1</td><td>92.7</td></tr></table></body></html></div>


performance drops across all Top-k metrics, with Top-1 accuracy declining by 1.2%. These results underscore the importance of the adapter in suppressing irrelevant signals and enhancing the utility of KG-based features for accurate prediction.



To further probe the role of the adapter, we visualize reaction embeddings before and after its application using UMAP (Figure 8). Before passing through the adapter, embeddings of different reaction classes show substantial overlap. After integration, four major reaction categories, namely heteroatom alkylation and arylation, acylation, C–C bond formation,and deprotections, each accounting for more than 10% of the test dataset, form compact and well-separated clusters. These results demonstrate that the adapter enhances both intra-class consistency and inter-class separability in the 

<div style="text-align: center;"><img src="https://pplines-online.bj.bcebos.com/deploy/official/paddleocr/general-layout-parsing-v3//a8de4738-841c-461f-87fc-c1b4dd879bf1/markdown_4/imgs/img_in_chart_box_608_246_1004_455.jpg?authorization=bce-auth-v1%2FALTAKzReLNvew3ySINYJ0fuAMN%2F2026-03-23T18%3A06%3A49Z%2F-1%2F%2Fbdc386326c0c48182875bdaef38c3ab899e59fb37834420f6a207f21598d93ce" alt="Image" width="32%" /></div>


<div style="text-align: center;">Figure 8: UMAP visualization of reaction embeddings before and after adapter. </div>


learned representations, even without explicit reaction type supervision, highlighting its role in injecting task-relevant chemical knowledge into retrosynthesis modeling.

### B.8 ANALYSIS OF THE VARIATIONAL BOTTLENECK PARAMETER β

To assess the impact of the variational bottleneck, we conduct a controlled study on the βparameter in Eq. (8) of the main paper, which regulates the strength of the KL divergence regularization. As shown in Table 13, performance remains broadly stable as β varies from 0.03 to 1.0, with the best Top-1 accuracy observed at $\beta=0.03$ . These results suggest that moderate values of β strike an effective balance between prediction accuracy and regularization strength.

<div style="text-align: center;">Table 13: Effect of the β on USPTO-50K.</div>



<div style="text-align: center;"><html><body><table border="1"><tr><td>β</td><td>Top-1</td><td>Top-3</td><td>Top-5</td><td>Top-10</td></tr><tr><td>0.03</td><td>60.36</td><td>80.49</td><td>85.74</td><td>91.23</td></tr><tr><td>0.1</td><td>60.25</td><td>79.85</td><td>84.42</td><td>89.49</td></tr><tr><td>0.3</td><td>60.14</td><td>79.81</td><td>85.12</td><td>90.55</td></tr><tr><td>0.5</td><td>59.54</td><td>79.95</td><td>85.46</td><td>90.55</td></tr><tr><td>1.0</td><td>58.48</td><td>79.91</td><td>85.54</td><td>90.85</td></tr></table></body></html></div>


### B.9 ANALYSIS OF THE IMPACT OF THE PRE-TRAINING STRATEGY 

We evaluate the effect of the pre-training strategy on the performance of the KnowRetro model (no test-time augmentation). Specifically, we compare KnowRetro, which includes a pre-training phase, with KnowRetro w/o PT, which removes it. As shown in Figure 9, KnowRetro (blue line) consistently outperforms KnowRetro w/o PT (red line) in terms of Top-1 accuracy throughout the training process. Notably, KnowRetro achieves higher accuracy from the early stages of training and maintains superior performance over time. In contrast, KnowRetro w/o PT shows slower improvements, particularly in the early training stages. These findings highlight the essential role of pre-training in improving both the learning efficiency and effectiveness of the model.

<div style="text-align: center;"><img src="https://pplines-online.bj.bcebos.com/deploy/official/paddleocr/general-layout-parsing-v3//a8de4738-841c-461f-87fc-c1b4dd879bf1/markdown_4/imgs/img_in_chart_box_632_951_984_1212.jpg?authorization=bce-auth-v1%2FALTAKzReLNvew3ySINYJ0fuAMN%2F2026-03-23T18%3A06%3A50Z%2F-1%2F%2Fcfb25ab993900d825380fc6d9fce39d4e52861d15901db690c4a4d4307ed29e6" alt="Image" width="28%" /></div>


<div style="text-align: center;">Figure 9: Top-1 accuracy comparison between KnowRetro and KnowRetro w/o PT.</div>


### B.1O ADDITIONAL ANALYSES OF REACTION DIVERSITY 

In addition to the Morgan fingerprint–based clustering analysis, we further evaluate diversity using MACCS keys and Bemis–Murcko scaffolds, which capture complementary aspects of molecular variation. MACCS keys represent a set of predefined structural fragments and quantify substructurelevel diversity. We compute pairwise similarities among the top-10 predictions for each product and 

<div style="text-align: center;"><img src="https://pplines-online.bj.bcebos.com/deploy/official/paddleocr/general-layout-parsing-v3//69887eb6-8e25-407e-b64b-27e0929d6d48/markdown_0/imgs/img_in_image_box_255_164_968_427.jpg?authorization=bce-auth-v1%2FALTAKzReLNvew3ySINYJ0fuAMN%2F2026-03-23T18%3A06%3A25Z%2F-1%2F%2F5bc97c45fa9429b106962ca5da0bdd2e3c1fa424f96255c059cecbeb780d7e09" alt="Image" width="58%" /></div>


<div style="text-align: center;">Figure 10: Attention patterns with and without hierarchical knowledge.</div>


<div style="text-align: center;"><img src="https://pplines-online.bj.bcebos.com/deploy/official/paddleocr/general-layout-parsing-v3//69887eb6-8e25-407e-b64b-27e0929d6d48/markdown_0/imgs/img_in_image_box_283_504_941_832.jpg?authorization=bce-auth-v1%2FALTAKzReLNvew3ySINYJ0fuAMN%2F2026-03-23T18%3A06%3A25Z%2F-1%2F%2Ff3dc329496cb048eb1d7a68ab7359b967b0698189d0cdba755c220c9eb11714c" alt="Image" width="53%" /></div>


<div style="text-align: center;">Figure 11: Multistep retrosynthesis generated by KnowRetro for Lenalidomide (DB00480).</div>


report the proportion of pairs below a threshold of 0.7. KnowRetro achieves 22.7% of prediction pairs below this threshold, compared with 20.0% for EditRetro, indicating that our model generates more chemically diverse reactants at the substructure level. Bemis–Murcko scaffolds, in contrast,reflect the core molecular frameworks and provide a measure of scaffold-level diversity. KnowRetro produces an average of 3.59 unique scaffolds per product, with 90.2% and 48.2% of products containing at least 2 and 4 distinct scaffolds, respectively. This level of scaffold diversity is comparable to methods such as EditRetro (4.04 on average), which achieve diversity through multi-site editing around predicted reaction centers. These complementary analyses further confirm that KnowRetro maintains substantial diversity across both substructure and scaffold levels, underscoring its applicability in broad retrosynthetic exploration.



### B.11 ATTENTION ANALYSIS WITH HIERARCHICAL KNOWLEDGE

Figure 10 shows that the model without KG produces diffuse, syntax-driven attention and fails to highlight the true cleavage site. KnowRetro, however, concentrates on both the reaction center (e.g. N-C bond) and the fragments directly attached to it. This localized and chemically consistent pattern indicates that hierarchical knowledge enables the model to focus on transformation-relevant structures, supporting more accurate and coherent retrosynthetic predictions.

### B.12 ADDITIONAL CASE OF MULTISTEP PLANNING 

To further validate the robustness of KnowRetro in multistep synthesis planning, we present an additional example on Lenalidomide (DB00480) (Ponomaryov et al., 2015), an immunomodulatory drug widely used in the treatment of multiple myeloma. Figure 11 shows the retrosynthetic route 

produced by iteratively applying the single-step model. KnowRetro produces a concise three-step route that aligns with known transformations, demonstrating coherent disconnection choices across steps and further supporting the effectiveness of the hierarchical knowledge in multistep reasoning.

## C PROOF 

### C.1PROOF OF LEMMA 1 (Task-relevant Knowledge Extraction)

We provide the proof of Lemma 1.

Proof. We prove Lemma 1 following the strategy of Proposition 3.1 in (Achille & Soatto, 2018).Suppose the product embedding eproduct is determined by the target $y^{\mathrm{r x n}}$ and task-irrelevant noise $\mathbf{e}_{n}$ , and the latent representation $\mathbf{z}_{\mathrm{p r o d u c t}}$ depends on $\mathbf{e}_{n}$ only through $\mathbf{e}_{\mathrm{p r o d u c t}}$ . We define the Markov $\mathrm{C h a i n}<(y^{r x n},\mathbf{e}_{n})\stackrel{\sim}{\rightarrow}\mathbf{e}_{\mathrm{p r o d u c t}}\stackrel{\sim}{\rightarrow}\mathbf{z}_{\mathrm{p r o d u c t}}\stackrel{\sim}{>}$ . According to the data processing inequality (DPI), it follows that:

$$\begin{aligned}{I(\mathbf{z}_{\operatorname{p r o d u c t}};\mathbf{e}_{\operatorname{p r o d u c t}})}&{{}{\geq}I(\mathbf{z}_{\operatorname{p r o d u c t}};y^{{r x n}},\mathbf{e}_{n})}\\ {}&{{}=I(\mathbf{z}_{\operatorname{p r o d u c t}};\mathbf{e}_{n})+I(\mathbf{z}_{\operatorname{p r o d u c t}};y^{{r x n}}|\mathbf{e}_{n})}\\ {}&{{}=I(\mathbf{z}_{\operatorname{p r o d u c t}};\mathbf{e}_{n})+H(y^{{r x n}}|\mathbf{e}_{n})-H(y^{{r x n}}|\mathbf{e}_{n};\mathbf{z}_{\operatorname{p r o d u c t}}).}\\ \end{aligned}$$

Since $\mathbf{e}_{n}$ is task-irrelevant noise independent of $y^{r x n}$ ,we have $H(y^{r x n}|\mathbf{e}_{n})=H(y^{r x n})$ and $H(y^{{r x n}}|\mathbf{e}_{n};\mathbf{z}_{\operatorname{p r o d u c t}})\leq H(y^{{r x n}}|\mathbf{z}_{\operatorname{p r o d u c t}})$ .Then, we have:

$$\begin{aligned}{I(\mathbf{z}_{\operatorname{p r o d u c t}};\mathbf{e}_{\operatorname{p r o d u c t}})}&{{}{\geq}I(\mathbf{z}_{\operatorname{p r o d u c t}};\mathbf{e}_{n})+H(y^{{r x n}}|\mathbf{e}_{n})-H(y^{{r x n}}|\mathbf{e}_{n};\mathbf{z}_{\operatorname{p r o d u c t}})}\\ {}&{{}{\geq}I(\mathbf{z}_{\operatorname{p r o d u c t}};\mathbf{e}_{n})+H(y^{{r x n}})-H(y^{{r x n}}|\mathbf{z}_{\operatorname{p r o d u c t}})}\\ {}&{{}=I(\mathbf{z}_{\operatorname{p r o d u c t}};\mathbf{e}_{n})+I(\mathbf{z}_{\operatorname{p r o d u c t}};y^{{r x n}}).}\\ \end{aligned}$$

Finally, we obtain $I(\mathbf{z}_{\mathrm{p r o d u c t}};\mathbf{e}_{n})\leq I(\mathbf{z}_{\mathrm{p r o d u c t}};\mathbf{e}_{\mathrm{p r o d u c t}})-I(\mathbf{z}_{\mathrm{p r o d u c t}};y^{r x n})$ 

## D LLM USAGE 

Large Language Models (LLMs) were used only for polishing the writing of this paper.

