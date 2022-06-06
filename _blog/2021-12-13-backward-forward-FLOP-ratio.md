---
layout: article
title: "What’s the backward-forward FLOP ratio for Neural Networks?"
subtitle: Subtitle
image: assets/images/posts/2022/backward-forward-FLOP-ratio.png
description: Determining the backward-forward FLOP ratio for neural networks, to help calculate their total training compute. 
external_url: https://www.alignmentforum.org/s/T9pBzinPXYB3mxSGi/p/fnjKpBoWJXcSDwhZk
tags: report

banner: true

toc: auto

date: 2021-12-13

authors:
  - name: Marius Hobbhahn
  - name: Jaime Sevilla
---

# Summary

1.  *Classic settings*, i.e. deep networks with convolutional layers and large batch sizes, ***almost always have backward-forward FLOP ratios close to 2:1***.
2.  Depending on the following criteria we can encounter **ratios between 1:1 and 3:1**
    1.  **Type of layer:** Passes through linear layers have as many FLOP as they use to do weight updates. Convolutional layers have many more FLOP for passes than for weight updates. Therefore, in CNNs, FLOP for weight updates basically play no role.
    2.  **Batch size:** Weights are updated after the gradients of the batch have been aggregated. Thus, FLOP for passes increase with batch size but stay constant for weight updates.
    3.  **Depth:** The first layer has a backward-forward ratio of 1:1 while all others have 2:1. Therefore, the overall ratio is influenced by the fraction of FLOP in first vs. FLOP in other layers.
3.  We assume the network is being optimized by stochastic gradient descent (w += ɑ⋅dw) and count the weight update as part of the backward pass. Other optimizers would imply different FLOP counts and could create ratios even larger than 3:1 for niche settings (see [appendix B](#appendix-b-using-other-optimizers)). However, the ratio of 2:1 in the classic setting (see point 1) should still hold even when you use momentum or Adam.

<table>
    <thead>
        <tr>
            <th>
                <p><strong>Compute-intensity of the weight update</strong></p>
            </th>
            <th>
                <p><strong>Most compute-intensive layers</strong></p>
            </th>
            <th>
                <p><strong>Backward-forward ratio</strong></p>
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan="2">
                <p>Large batch size OR compute-intensive convolutional layer</p>
            </td>
            <td>
                <p>First layer</p>
            </td>
            <td>
                <p>1:1</p>
            </td>
        </tr>
        <tr>
            <td>
                <p>Other layers</p>
            </td>
            <td rowspan="2">
                <p>2:1</p>
            </td>
        </tr>
        <tr>
            <td rowspan="2">
                <p>Small batch size AND no compute-intensive convolutional layers</p>
            </td>
            <td>
                <p>First layer</p>
            </td>
        </tr>
        <tr>
            <td>
                <p>Other layers</p>
            </td>
            <td>
                <p>3:1</p>
            </td>
        </tr>
    </tbody>
</table>

# Introduction

How many more floating-point operations (FLOP) does it take to compute a backward pass than a forward pass in a neural network? We call this the backward-forward FLOP ratio. 

This ratio is useful to estimate the total amount of training compute from the forward compute; something we are interested in the context of our study of [Parameter, Compute and Data Trends in Machine Learning]({% link _blog/2022-02-16-compute-trends.md %}).


In this post, we first provide a theoretical analysis of the ratio, and we then corroborate our findings empirically.

# Theory

To understand where the differences in ratios come from, we need to look at the classical [equations of backpropagation](http://neuralnetworksanddeeplearning.com/chap2.html#:~:text=The%20backpropagation%20equations%20provide%20us,%3D%CF%83(zl).).

<figure>
  <img src="https://lh6.googleusercontent.com/5jYwS-GY8kdRWevo4xBlknLcDfVUqhvkvZ7BouG3ykSi55Y9gkK5ImWwFczEEouGYiMu-Upzok9e5qIWWDM2Yjg9f0_7jQQnwvwg-FNTER17FiiqMw7CKPwd-oQEvLNiCljFklhk">
</figure>

Let’s start with a simple example---a neural network with 2 hidden layers.

<figure>
  <img src="https://lh6.googleusercontent.com/S0c_d-WAilKWRA1Oa4WYLfSfj9Xn6NmT5YGZRhh8GK2SunZ4l9GLY-gLcnCWTT_F0TJRvITj1-bfsrAQ1x2__eSJj0hTayzqQQMmUt8QNOh-SsaGgNRC6vHM27WcAqc-bnL2Nvu2">
</figure>

In this example, we have the following computations for forward and backward pass assuming linear layers with ReLU activations. The “@”-symbols denote matrix multiplications. 

<table style="word-break: break-word">
    <thead>
        <tr>
            <td style="vertical-align:top">
                <p><strong>Operation</strong></p>
            </td>
            <td style="vertical-align:top">
                <p><strong>Computation</strong></p>
            </td>
            <td style="vertical-align:top">
                <p><strong>FLOP forward</strong></p>
            </td>
            <td style="vertical-align:top">
                <p><strong>Computation</strong></p>
            </td>
            <td style="vertical-align:top">
                <p><strong>FLOP backward</strong></p>
            </td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="background-color:#c9daf8;vertical-align:top">Input</td>
            <td style="background-color:#c9daf8;vertical-align:top">A1=W1@X</td>
            <td style="background-color:#c9daf8;vertical-align:top">2*#input*#hidden1*#batch</td>
            <td style="background-color:#c9daf8;vertical-align:top">dL/dW1 = δ1@X</td>
            <td style="background-color:#c9daf8;vertical-align:top">2*#input*#hidden1*#batch</td>
        </tr>
        <tr>
            <td style="background-color:#c9daf8;vertical-align:top">ReLU</td>
            <td style="background-color:#c9daf8;vertical-align:top">A1R=ReLU(A1)</td>
            <td style="background-color:#c9daf8;vertical-align:top">#hidden1*#batch</td>
            <td style="background-color:#c9daf8;vertical-align:top">δ1 = dδ1R/dA1</td>
            <td style="background-color:#c9daf8;vertical-align:top">#hidden1*#batch</td>
        </tr>
        <tr>
            <td style="background-color:#fce5cd;vertical-align:top">Derivative</td>
            <td style="background-color:#fce5cd;vertical-align:top">&nbsp;</td>
            <td style="background-color:#fce5cd;vertical-align:top">&nbsp;</td>
            <td style="background-color:#fce5cd;vertical-align:top">
                <p>δ1R=dL/dA2</p>
                <p>=W2@δ2</p>
            </td>
            <td style="background-color:#fce5cd;vertical-align:top">2*#hidden1*#hidden2*#batch</td>
        </tr>
        <tr>
            <td style="background-color:#fce5cd;vertical-align:top">Hidden1</td>
            <td style="background-color:#fce5cd;vertical-align:top">A2=W2@A1R</td>
            <td style="background-color:#fce5cd;vertical-align:top">2*#hidden1*#hidden2*#batch</td>
            <td style="background-color:#fce5cd;vertical-align:top">
                <p>dL/dW2</p>
                <p>=δ2@A1R</p>
            </td>
            <td style="background-color:#fce5cd;vertical-align:top">2*#hidden1*#hidden2*#batch</td>
        </tr>
        <tr>
            <td style="background-color:#fce5cd;vertical-align:top">ReLU</td>
            <td style="background-color:#fce5cd;vertical-align:top">A2R=ReLU(A2)</td>
            <td style="background-color:#fce5cd;vertical-align:top">#hidden2*#batch</td>
            <td style="background-color:#fce5cd;vertical-align:top">δ2 = dδ2R/dA2</td>
            <td style="background-color:#fce5cd;vertical-align:top">#hidden2*#batch</td>
        </tr>
        <tr>
            <td style="background-color:#fff2cc;vertical-align:top">Derivative</td>
            <td style="background-color:#fff2cc;vertical-align:top">&nbsp;</td>
            <td style="background-color:#fff2cc;vertical-align:top">&nbsp;</td>
            <td style="background-color:#fff2cc;vertical-align:top">δ2R=dL/dA3 =W3@δ3</td>
            <td style="background-color:#fff2cc;vertical-align:top">2*#hidden2*#output*#batch</td>
        </tr>
        <tr>
            <td style="background-color:#fff2cc;vertical-align:top">Hidden2</td>
            <td style="background-color:#fff2cc;vertical-align:top">A3=W3@A2R</td>
            <td style="background-color:#fff2cc;vertical-align:top">2*#hidden2*#output*#batch</td>
            <td style="background-color:#fff2cc;vertical-align:top">dL/dW3 =δ3@A2R</td>
            <td style="background-color:#fff2cc;vertical-align:top">2*#hidden2*#output*#batch</td>
        </tr>
        <tr>
            <td style="background-color:#fff2cc;vertical-align:top">ReLU</td>
            <td style="background-color:#fff2cc;vertical-align:top">A3R=ReLU(A3)</td>
            <td style="background-color:#fff2cc;vertical-align:top">#output*#batch</td>
            <td style="background-color:#fff2cc;vertical-align:top">δ3 = dδ3R/dA3</td>
            <td style="background-color:#fff2cc;vertical-align:top">#output*#batch</td>
        </tr>
        <tr>
            <td style="background-color:#d9ead3;vertical-align:top">Loss</td>
            <td style="background-color:#d9ead3;vertical-align:top">L=loss(A3R,Y)</td>
            <td style="background-color:#d9ead3;vertical-align:top">#output*#batch</td>
            <td style="background-color:#d9ead3;vertical-align:top">δ3R = dL/dA3R</td>
            <td style="background-color:#d9ead3;vertical-align:top">#output*#batch</td>
        </tr>
        <tr>
            <td style="background-color:#d9d2e9;vertical-align:top">Update</td>
            <td style="background-color:#d9d2e9;vertical-align:top">&nbsp;</td>
            <td style="background-color:#d9d2e9;vertical-align:top">&nbsp;</td>
            <td style="background-color:#d9d2e9;vertical-align:top">W+=lr*δW</td>
            <td style="background-color:#d9d2e9;vertical-align:top">2*#weights</td>
        </tr>
    </tbody>
</table>

  
 We separate the weight update from the individual layers since the update is done after aggregation, i.e. we first add all gradients coming from different batches and then multiply with the learning rate. 

From this table we see

1.  ReLUs and the loss function contribute a negligible amount of FLOP compared to layers.
2.  For the first layer, the backward-forward FLOP ratio is 1:1
3.  For all other layers, the backward-forward FLOP ratio is 2:1 (ignoring ReLUs)

In equation form, the formula for the backward-forward FLOP ratio is:

backward / forward = 

(FIRST LAYER FORWARD FLOP + 2*OTHER LAYERS FORWARD FLOP + WEIGHT UPDATE) / (FIRST LAYER FORWARD FLOP + OTHER LAYERS FORWARD FLOP)
{:.centered}

There are two considerations to see which terms dominate in this equation:

1.  How much of the computation happens in the first layer?
2.  How many operations does the weight update take compared to the computation in the layers? If the batch size is large or many parameters are shared, this term can be dismissed. Otherwise, it can be approximated as WEIGHT UPDATE ≈ FIRST LAYER FORWARD FLOP + OTHER LAYERS FORWARD FLOP.

This leads us to four possible cases:

<table>
    <tbody>
        <tr>
            <td style="border-top-color: transparent !important; border-left-color: transparent !important"></td>
            <td>
                <p><strong>Big weight update</strong></p>
            </td>
            <td>
                <p><strong>Small weight update</strong></p>
            </td>
        </tr>
        <tr>
            <td>
                <p><strong>First layer dominant</strong></p>
            </td>
            <td>
                <p>2*FIRST LAYER FORWARD FLOP / FIRST LAYER FORWARD FLOP = <strong>2:1</strong></p>
            </td>
            <td>
                <p>FIRST LAYER FORWARD FLOP / FIRST LAYER FORWARD FLOP = <strong>1:1</strong></p>
            </td>
        </tr>
        <tr>
            <td>
                <p><strong>Other layers dominant</strong></p>
            </td>
            <td>
                <p>3*OTHER LAYERS FORWARD FLOP / OTHER LAYERS FORWARD FLOP = <strong>3:1</strong></p>
            </td>
            <td>
                <p>2*OTHER LAYERS FORWARD FLOP / OTHER LAYERS FORWARD FLOP = <strong>2:1</strong></p>
            </td>
        </tr>
    </tbody>
</table>

  
  
 The norm in modern Machine Learning is **deep networks** with **large batch sizes**, where our analysis predicts a ratio close to **2:1**.

In short, our theoretical analysis predicts that the backward-forward FLOP ratio will be between **1:1 and 3:1**, with **2:1** being the typical case.

# Empirical results

To corroborate our analysis we use [NVIDIA’s pyprof profiler](https://docs.nvidia.com/deeplearning/frameworks/pyprof-user-guide/profile.html) to audit the amount of FLOP in each layer during the backward and forward pass.

In this section we will explore:

*   The difference between the backward-forward ratio in the first and the rest of the layers.
*   The difference between the weight update in convolutional and linear layers.
*   The effect of a large batch size on the weight update.
*   The effect of depth on the backward-forward ratio.
*   The combined effects of batch-size, convolutional layers and depth.

*In short, our empirical results confirm our theoretical findings*. 

In a [previous post]({% link _blog/2021-11-29-measure-FLOPs-empirically.md %}), we tried to estimate utilization rates. As detailed in the previous post, the profiler does under- and overcounting. Thus, we believe some of the estimates are slightly off. 

We have tried to correct them as much as possible. In particular, we eliminate some operations which we believe are double-counted, and we add the operations corresponding to multiplication by the learning rate which we believe are not counted in stochastic gradient descent.

## Backward and forward FLOP in the first and the rest of the layers

We can investigate this empirically by looking at a simple linear network (code in [appendix](#appendix-a-code-for-all-networks)).

It results in the following FLOP counts:

<figure style="width: 50% !important">
  <img src="https://lh6.googleusercontent.com/TJLh3y8th56sF-XWIr-sopHEzZ5BnlB-IPnVAOb1Zot9nL9Amm6S5A__lxE9h6ivF6mB2TcDx9it3w4aC9gHVUPmyjsqtyY5sBcpPgqrts85rI9zUQsgXG-wnyW8GiGcg06tHVkk">
</figure>

We can see that the first layer (red) has the same flop count for forward and backward pass while the other layers (blue, green) have a ratio of 2:1. The final weight update (yellow) is 2x the number of parameters of the network. 

## Type of layer

The number of FLOP is different for different types of layers.

<figure>
  <img src="https://39669.cdn.cke-cs.com/rQvD3VnunXZu34m86e5f/images/35b5f0c50d84acd15c76a8def63fc24dbe1d5a0a19c95e85.png">
</figure>

 As we can see, the number of FLOP for linear layers is 2x their number of parameters. For CNNs the number of FLOP is much higher than the number of parameters. This means that the final weight update is basically negligible for CNNs but relevant for linear networks. 

To show this empirically, we look at the profiler FLOP counts of a small CNN (code in [appendix](#appendix-a-code-for-all-networks)). 

<figure style="width: 50% !important">
  <img src="https://lh3.googleusercontent.com/4rPIY_MOH6Fg5_rxcBBULW5BLuKrB8_-MGij8ryeM-c2O8hic3PWAQJ3rmuy6sAo7ejtALwKSmaywCDNZA93Dkjzr7hsur8IowR4z2eVZJgdajFTGQoXYdWUieN7dorKfxGwoCL8">
</figure>

Similar to the linear network, we can confirm that the backward-forward ratio for the first layer is 1:1 and that of all others 2:1. However, the number of FLOP in layers (red, blue, green) is much larger than for the weight update (yellow).

## Batch size

Gradients are aggregated before the weight update. Thus, the FLOP for weight updates stays the same for different batch sizes (yellow) while the FLOP for all other operations scales with the batch size (blue, green, red). As a consequence, larger batch sizes make the FLOP from weight updates negligibly small. 

<figure>
  <img src="https://lh3.googleusercontent.com/qexSxYBU7611GHCUuC-AvtT0dJW1jJuBrGPNmMhhJGe-Uy21ysXufOQGRCjnJrFzGOsQ5eCiweLpq0s3GC-y6e-947ZmxJEmEmtTXyi0nR0bkXUIEHjVBHg5xii5Z1aFqup6k9PQ">
</figure>

## Depth

Depth, i.e. the number of layers only has an indirect influence. This stems from the fact that the first layer has a ratio of 1:1 while further layers have a ratio of 2:1. Thus, the true influence comes from FLOP in the first layer vs. every other layer.

To show this effect, we define a CNN with different numbers of intermediate conv layers (code in [appendix](#appendix-a-code-for-all-networks)). 

We find that the backward-forward starts significantly below 2:1 for 0 intermediate layers and converges towards 2:1 when increasing the number of intermediate layers. 

<figure>
  <img src="https://lh5.googleusercontent.com/T24ibTLUgncweExBMXbBX1e4N0pLGBFTg2F8gjSU8f9wXntjCUtR6sXa251UL75I6-eMZLjaAifI3DhLn_RSW5t3RFwm3FinPi8rGE9jI1c9uhG1S1fo0WHoJ6KRBO1Ajj-ARUax">
</figure>

Most common deep learning CNN architectures are deep enough that the first layer shouldn’t have a strong effect on the overall number of FLOP and thus the ratio should be close to 2:1. We have empirically tested this for multiple different types of resnets and batch sizes. We observe some diverge from the expected 2:1 ratio but we think that this is a result of the profiler undercounting certain operations. We have described problems with the profiler in the [previous post]({% link _blog/2021-11-29-measure-FLOPs-empirically.md %}).

<figure>
  <img src="https://lh4.googleusercontent.com/jXTwTdOotVqzG4H-ZzmYAiKIAVW79O7kAgnvYUlgC0reBqbcxvWg8S1x14Qp8pcDKCBM6IfCKNWYTJjsmoeQg-ZPuKaCKlyMApkZqvr1dYrtgcNi05uHVsLd8tTTpVs-odYuSrY9">
</figure>
<div class="caption">
  Backward-forward FLOP ratio in different architectures. Read the labels as architecture_batchsize.
</div>

## Combining all above

There are interdependencies of batch size, type of layer and depth which we want to explore in the following. We compare the small CNN and the linear network that were already used before with a network we call OneNet (code in [appendix](#appendix-a-code-for-all-networks)). OneNet has only one input neuron and a larger second and third layer. Thus, the ratio between the first and other layers is very small and we can see that the theoretical maximum for the backward-forward ratio of 3:1 can be observed in practice. 

Furthermore, we look at exponentially increasing batch sizes for all three architectures. In the case of linear networks, i.e. LinearNet and OneNet, the ratio decreases with increasing batch size since the influence of the weight update is reduced. In the case of the CNN, the FLOP count is completely dominated by layers and the weight update is negligible. This effect is so strong that no change can be observed in the figure.

We see that LinearNet converges to a backward-forward ratio of 1:1 for larger batch sizes while OneNet converges to 2:1. This is because nearly all weights of LinearNet are in the first layer and nearly all weights of OneNet in the other layers.

<figure>
  <img src="https://lh6.googleusercontent.com/Ca92ne5fQoSKPiBJqsiI-7ESLybkkslhTus5vH8b7cuCYin54mmLTbFlbs42e9Y-f_2Y4m5Skk2rDuY_LcNZlFiKfyp4n7n3oZuP-GwgsLXRQQEmI5zT8CwqF3ADepXyr_B-L-lW">
</figure>

# Conclusion

We have reasoned that the backward-forward FLOP ratio in Neural Networks will typically be between 1:1 and 3:1, and most often close to 2:1.

The ratio depends on the batch size, how much computation happens in the first layer versus the others, the degree of parameter sharing and the batch size.

We have confirmed this in practice. However, we have used a profiler with some problems, so we cannot completely rule out a mistake.

# Acknowledgment

The experiments have been conducted by Marius Hobbhahn. The text was written by Marius Hobbhahn and Jaime Sevilla.

Lennart Heim helped greatly with discussion and support. We also thank Danny Hernandez and Girish Sastry for discussion.

# Appendix A: Code for all networks

    ### linear network with large first layer and small later layers
    class LinearNet(nn.Module):
        def __init__(self):
            super().__init__()
            self.fc1 = nn.Linear(224*224*3, 4096)
            self.fc2 = nn.Linear(4096, 128)
            self.fc3 = nn.Linear(128, 10)
    
        def forward(self, x):
            x = torch.flatten(x, 1) # flatten all dimensions except batch
            x = F.relu(self.fc1(x))
            x = F.relu(self.fc2(x))
            x = self.fc3(x)
            return x
    
    ### linear network with just one input but larger intermediate layers
    class OneNet(nn.Module):
        def __init__(self):
            super().__init__()
            self.fc1 = nn.Linear(1, 4096)
            self.fc2 = nn.Linear(4096, 128)
            self.fc3 = nn.Linear(128, 10)
    
        def forward(self, x):
            x = torch.flatten(x, 1) # flatten all dimensions except batch
            x = F.relu(self.fc1(x))
            x = F.relu(self.fc2(x))
            x = self.fc3(x)
            return x
    
    ### small conv net
    class ConvNet(nn.Module):
    
        def __init__(self):
            super(ConvNet, self).__init__()
            self.conv1 = nn.Conv2d(3, 32, kernel_size=7, stride=2, padding=3, bias=False)
            self.relu = nn.ReLU(inplace=True)
            self.maxpool = nn.MaxPool2d(kernel_size=3, stride=2, padding=1)
            self.conv2 = nn.Conv2d(32, 64, kernel_size=7, stride=2, padding=3, bias=False)
            self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
            self.fc1 = nn.Linear(64, 10)
    
        def forward(self, x):
            x = self.maxpool(self.relu(self.conv1(x)))
            x = self.maxpool(self.relu(self.conv2(x)))
            x = self.avgpool(x)
            x = torch.flatten(x, 1) # flatten all dimensions except batch
            x = self.fc1(x)
            return x
    
    ### conv net with different sizes for intermediate layers
    class DeeperConvNet(nn.Module):
    
        def __init__(self):
            super(DeeperConvNet, self).__init__()
            self.first_layer = nn.Sequential(
                nn.Conv2d(3, 32, kernel_size=7, stride=2, padding=3, bias=False),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(kernel_size=3, stride=2)
            )
            self.conv_layer = nn.Sequential(
                nn.Conv2d(32, 32, kernel_size=3, stride=1, padding=1, bias=False),
                nn.ReLU(inplace=True)
            )
            self.relu = nn.ReLU(inplace=True)
            self.maxpool = nn.MaxPool2d(kernel_size=3, stride=2, padding=1)
            self.convN = nn.Conv2d(32, 64, kernel_size=7, stride=2, padding=3, bias=False)
            self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
            self.fc1 = nn.Linear(64, 10)
    
        def forward(self, x):
            x = self.first_layer(x)
            for i in range(100):
                x = self.conv_layer(x)
            x = self.relu(self.convN(x))
            x = self.avgpool(x)
            x = torch.flatten(x, 1) # flatten all dimensions except batch
            x = self.fc1(x)
            return x

# Appendix B: Using other optimizers

Through this post we have assumed stochastic gradient descent (SGD) for the weight update. SGD involves multiplying the gradient by a learning rate and adding the result to the current weights. That is, it requires 2 FLOP per parameter.

Other optimizers require some extra work. For example, consider [adaptive moment estimation (Adam)](https://arxiv.org/abs/1412.6980). Adam’s parameter update is given by:

<figure>
  <img src="https://lh4.googleusercontent.com/orn7zIGdl5T7KJ4eu2fKhbMcFhUnFSizCGc4nnjA9phIQxTnRdovOGDGVrP1qvowMxFkCZluN9wLS7iI6R46jhQiTzT7rGSUAWm7XO2IcYXxi7V7s7g7HgMPa2N5OPBcKSFzSyNA">
</figure>

For a total of ~3 + 4 + 3 + 3 + 5 = 18 FLOP per parameter.

In any case, the choice of optimizer affects only the weight update and the amount of FLOP is proportional to the number of parameters. Since batch sizes are typically large, the difference will be small and won’t affect the backward-forward ratio much.

