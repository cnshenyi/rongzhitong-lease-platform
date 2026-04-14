<template>
  <div class="due-diligence-report">
    <!-- 顶部操作栏 -->
    <div class="report-header">
      <div class="header-left">
        <h2>{{ reportData.projectName }}</h2>
        <el-tag :type="getStatusType(reportData.status)" size="large">
          {{ reportData.status }}
        </el-tag>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">返回列表</el-button>
        <el-button type="primary" @click="saveReport">保存</el-button>
        <el-button @click="exportWord">导出Word</el-button>
        <el-button @click="exportPDF">导出PDF</el-button>
      </div>
    </div>

    <!-- 三栏布局 -->
    <div class="report-content">
      <!-- 左侧：目录导航 -->
      <div class="toc-sidebar">
        <div class="toc-title">报告目录</div>
        <div class="toc-list">
          <div
            v-for="chapter in chapters"
            :key="chapter.id"
            class="toc-chapter"
            :class="{ active: activeChapter === chapter.id }"
          >
            <div class="chapter-title" @click="scrollToChapter(chapter.id)">
              {{ chapter.title }}
            </div>
            <div class="toc-sections">
              <div
                v-for="section in chapter.sections"
                :key="section.id"
                class="toc-section"
                :class="{ active: activeSection === section.id }"
                @click="scrollToSection(section.id)"
              >
                {{ section.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：报告内容 -->
      <div class="report-main" ref="reportMainRef" @scroll="handleScroll">
        <!-- 第一章：项目概况 -->
        <div :id="'chapter-1'" class="chapter">
          <h2 class="chapter-title">第一章 项目概况</h2>
          
          <div :id="'section-1-1'" class="section">
            <h3 class="section-title">1.1 基本信息</h3>
            <p>本次尽职调查项目涉及XX医院申请融资租赁医疗设备的业务。项目编号为PROJ-2024-001，承租人为XX医院，成立于2010年，注册资本5000万元人民币，法定代表人为张某某。医院位于某市核心医疗区域，占地面积约2万平方米，建筑面积约5万平方米。</p>
            <p>本次融资租赁标的物为一批高端医疗设备，包括核磁共振成像系统（MRI）1台、数字减影血管造影系统（DSA）1台、全自动生化分析仪2台等，设备总价值约3000万元人民币。租赁期限为36个月，采用等额本息还款方式，年化利率为6.5%。</p>
          </div>

          <div :id="'section-1-2'" class="section">
            <h3 class="section-title">1.2 项目背景</h3>
            <p>XX医院是一家综合性三级甲等医院，近年来业务发展迅速，年门诊量超过80万人次，住院患者超过3万人次。为了提升医疗服务能力，满足日益增长的患者需求，医院计划引进一批先进的医疗设备。</p>
            <p>由于医院自有资金有限，且希望保持资金流动性用于日常运营，因此选择通过融资租赁方式获取设备。这种方式既能满足设备更新需求，又能减轻一次性资金压力，符合医院当前的财务状况和发展战略。医院在过去三年中保持了良好的经营业绩，营业收入年均增长率达到15%，具备较强的租金支付能力。</p>
          </div>

          <div :id="'section-1-3'" class="section">
            <h3 class="section-title">1.3 租赁方案</h3>
            <p>本项目采用直接融资租赁模式，由出租人根据承租人的选择购买指定设备，并出租给承租人使用。租赁期限为36个月，租金总额为3250万元（含本金3000万元及利息250万元），采用等额本息方式按月支付，每月租金约90.28万元。</p>
            <p>租赁期间，设备所有权归出租人所有，承租人享有使用权。承租人负责设备的日常维护和保养，并购买相应的保险。租赁期满后，承租人可以选择以名义价格（1000元）留购设备，或选择续租、退租。根据双方约定，承租人需支付首付款300万元（占设备价值的10%），剩余部分通过租金分期支付。</p>
          </div>
        </div>

        <!-- 第二章：承租人基本情况 -->
        <div :id="'chapter-2'" class="chapter">
          <h2 class="chapter-title">第二章 承租人基本情况</h2>
          
          <div :id="'section-2-1'" class="section">
            <h3 class="section-title">2.1 企业信息</h3>
            <p>XX医院成立于2010年3月，统一社会信用代码为91XXXXXXXXXX，注册资本5000万元人民币，实缴资本5000万元。医院性质为民营非营利性医疗机构，主管部门为某市卫生健康委员会。法定代表人张某某，现年52岁，医学博士，主任医师，从事医疗行业30余年，具有丰富的医院管理经验。</p>
            <p>医院现有职工680人，其中医生220人（高级职称80人，中级职称100人），护士380人，行政及后勤人员80人。医院设有内科、外科、妇产科、儿科、急诊科等20个临床科室，以及检验科、影像科、药剂科等10个医技科室。医院拥有床位500张，年门诊量超过80万人次，年住院患者超过3万人次，手术量超过8000台次。</p>
          </div>

          <div :id="'section-2-2'" class="section">
            <h3 class="section-title">2.2 股权结构</h3>
            <p>XX医院的股权结构较为清晰，共有3名自然人股东。第一大股东为张某某，持股比例60%，出资3000万元；第二大股东为李某某，持股比例30%，出资1500万元；第三股东为王某某，持股比例10%，出资500万元。三位股东均为医疗行业资深人士，在当地医疗圈具有良好的声誉和人脉资源。</p>
            <p>医院章程规定，重大事项需经股东会三分之二以上表决权通过。目前医院股权结构稳定，股东之间合作良好，未发现股权纠纷或潜在的股权变动风险。根据尽调访谈，股东们对医院的长期发展充满信心，短期内无股权转让或退出计划。</p>
          </div>

          <div :id="'section-2-3'" class="section">
            <h3 class="section-title">2.3 经营范围</h3>
            <p>根据医院的《医疗机构执业许可证》，其核准的诊疗科目包括：内科、外科、妇产科、儿科、急诊医学科、麻醉科、医学检验科、医学影像科、中医科、口腔科、眼科、耳鼻咽喉科、皮肤科、康复医学科等。医院具备开展常见病、多发病以及部分疑难病症的诊疗能力。</p>
            <p>医院的主要业务收入来源包括：门诊收入（占比约40%）、住院收入（占比约50%）、体检收入（占比约8%）、其他收入（占比约2%）。近年来，医院积极拓展特色专科，重点发展心血管内科、骨科、妇产科等优势学科，形成了一定的品牌影响力。医院还与多家保险公司建立了合作关系，成为其定点医疗机构，进一步拓宽了患者来源渠道。</p>
          </div>
        </div>

        <!-- 第三章：财务状况分析 -->
        <div :id="'chapter-3'" class="chapter">
          <h2 class="chapter-title">第三章 财务状况分析</h2>
          
          <div :id="'section-3-1'" class="section">
            <h3 class="section-title">3.1 资产负债分析</h3>
            <p>根据XX医院提供的2021-2023年度审计报告，医院的资产规模呈稳步增长态势。截至2023年12月31日，医院总资产为1.85亿元，较2022年增长12.1%。其中，流动资产0.95亿元，占比51.4%；非流动资产0.90亿元，占比48.6%。流动资产主要包括货币资金0.35亿元、应收账款0.42亿元、存货0.15亿元等。</p>
            <p>负债方面，医院总负债为0.88亿元，其中流动负债0.65亿元，非流动负债0.23亿元。流动负债主要包括应付账款0.28亿元、应付职工薪酬0.15亿元、其他应付款0.18亿元等。非流动负债主要为长期借款0.20亿元。医院资产负债率为47.6%，处于合理水平，财务结构较为稳健。净资产为0.97亿元，较上年增长8.9%。</p>
          </div>

          <div :id="'section-3-2'" class="section">
            <h3 class="section-title">3.2 盈利能力分析</h3>
            <p>从盈利能力来看，XX医院近三年保持了良好的盈利水平。2023年度，医院实现营业收入2.35亿元，同比增长15.2%；营业成本1.68亿元，同比增长12.8%；营业利润0.28亿元，同比增长22.6%；净利润0.22亿元，同比增长20.5%。医院的营业收入增长主要得益于门诊量和住院量的持续增长，以及医疗服务价格的合理调整。</p>
            <p>从盈利能力指标来看，2023年医院的毛利率为28.5%，较上年提升1.2个百分点；净利率为9.4%，较上年提升0.4个百分点；总资产收益率（ROA）为12.5%，净资产收益率（ROE）为22.7%，均处于行业较好水平。医院的盈利能力稳定且呈上升趋势，为租金支付提供了良好的保障。</p>
          </div>

          <div :id="'section-3-3'" class="section">
            <h3 class="section-title">3.3 现金流分析</h3>
            <p>现金流是评估企业偿债能力的重要指标。2023年度，XX医院经营活动产生的现金流量净额为0.32亿元，较上年增长18.5%。医院的现金流入主要来自医疗服务收入，现金流出主要用于支付职工薪酬、采购药品和医疗耗材、支付各项费用等。医院的经营活动现金流量净额持续为正，且呈增长趋势，表明医院的经营活动能够产生稳定的现金流入。</p>
            <p>投资活动方面，2023年医院投资活动产生的现金流量净额为-0.18亿元，主要用于购置医疗设备和改善医疗设施。筹资活动方面，现金流量净额为-0.08亿元，主要用于偿还银行借款和支付利息。综合来看，医院的现金流状况良好，货币资金充足，能够满足日常运营和租金支付的需要。</p>
          </div>

          <div :id="'section-3-4'" class="section">
            <h3 class="section-title">3.4 财务指标汇总</h3>
            <p>综合分析XX医院的主要财务指标，医院的偿债能力较强。流动比率为1.46，速动比率为1.23，均高于行业平均水平，表明医院的短期偿债能力良好。资产负债率为47.6%，处于合理区间，财务风险可控。利息保障倍数为18.7，远高于安全线，表明医院有充足的盈利能力支付利息费用。</p>
            <p>从营运能力来看，应收账款周转率为6.2次/年，应收账款周转天数为59天，处于行业正常水平。存货周转率为15.8次/年，存货周转天数为23天，表明医院的存货管理效率较高。总资产周转率为1.33次/年，表明医院的资产利用效率良好。综合评估，XX医院的财务状况健康，具备较强的租金支付能力和抗风险能力。</p>
          </div>
        </div>

<!-- 第四章：经营状况分析 -->
        <div :id="'chapter-4'" class="chapter">
          <h2 class="chapter-title">第四章 经营状况分析</h2>
          <div :id="'section-4-1'" class="section">
            <h3 class="section-title">4.1 业务模式</h3>
            <p>XX医院采用"医疗服务+健康管理"的综合业务模式。医院以临床诊疗为核心业务，同时积极拓展健康体检、康复护理、远程医疗等延伸服务。医院与多家三甲医院建立了医联体合作关系，实现了专家资源共享和双向转诊，有效提升了医疗服务水平和患者满意度。</p>
            <p>在收入结构方面，医院的医疗服务收入占比约85%，其中门诊收入占40%、住院收入占50%、其他医疗收入占10%。非医疗收入主要来自健康体检（占比8%）和其他服务（占比2%）。医院的收入来源多元化，降低了对单一业务的依赖风险。近年来，医院积极推进信息化建设，上线了HIS、LIS、PACS等系统，提升了运营效率。</p>
          </div>
          <div :id="'section-4-2'" class="section">
            <h3 class="section-title">4.2 市场地位</h3>
            <p>XX医院在当地医疗市场中占据重要地位。根据市卫健委统计数据，医院在全市民营医院中综合排名前三，在心血管内科、骨科等优势学科领域具有较强的竞争力。医院的品牌知名度和患者口碑良好，患者满意度调查结果连续三年保持在90%以上。</p>
            <p>医院所在区域常住人口约200万人，医疗资源相对紧张，市场需求旺盛。医院的服务半径覆盖周边50公里范围，辐射人口约150万人。随着城镇化进程加快和居民健康意识提升，医疗服务需求持续增长，为医院的发展提供了良好的市场环境。</p>
          </div>
          <div :id="'section-4-3'" class="section">
            <h3 class="section-title">4.3 核心竞争力</h3>
            <p>XX医院的核心竞争力主要体现在以下几个方面：一是人才优势，医院拥有一批经验丰富的医疗专家，高级职称医生占比达36%；二是设备优势，医院配备了CT、MRI、DSA等大型医疗设备，能够满足各类诊疗需求；三是服务优势，医院推行"以患者为中心"的服务理念，提供全程化、个性化的医疗服务。</p>
            <p>此外，医院在学科建设方面持续投入，心血管内科已成为市级重点学科，骨科和妇产科也在积极申报。医院每年投入营业收入的3%用于科研和学科建设，近三年共发表学术论文120余篇，获得省市级科研课题15项。这些核心竞争力为医院的可持续发展奠定了坚实基础。</p>
          </div>
        </div>

        <!-- 第五章：行业分析 -->
        <div :id="'chapter-5'" class="chapter">
          <h2 class="chapter-title">第五章 行业分析</h2>
          <div :id="'section-5-1'" class="section">
            <h3 class="section-title">5.1 行业概况</h3>
            <p>中国医疗服务行业是国民经济的重要组成部分，近年来保持了快速发展态势。根据国家统计局数据，2023年全国卫生总费用达到8.5万亿元，占GDP比重约6.8%。全国医疗卫生机构总数超过107万个，其中医院3.7万个，民营医院2.5万个，占比约67.6%。</p>
            <p>国家持续推进医疗卫生体制改革，鼓励社会资本办医，为民营医院的发展创造了良好的政策环境。《"健康中国2030"规划纲要》明确提出要建立覆盖城乡的基本医疗卫生制度，为全体人民提供公平可及的医疗服务。医疗设备融资租赁作为医院设备更新的重要融资渠道，市场规模持续扩大。</p>
          </div>
          <div :id="'section-5-2'" class="section">
            <h3 class="section-title">5.2 市场规模</h3>
            <p>中国医疗器械市场规模持续增长，2023年市场规模达到1.2万亿元，同比增长12.5%。其中，医疗设备占比约45%，体外诊断占比约20%，高值耗材占比约18%，低值耗材占比约17%。预计到2028年，中国医疗器械市场规模将突破2万亿元。</p>
            <p>医疗设备融资租赁市场方面，2023年新增业务规模约2000亿元，同比增长15%。融资租赁已成为医院获取大型医疗设备的主要方式之一，特别是对于资金实力有限的民营医院和基层医疗机构。随着分级诊疗制度的推进和基层医疗机构设备升级需求的释放，医疗设备融资租赁市场前景广阔。</p>
          </div>
          <div :id="'section-5-3'" class="section">
            <h3 class="section-title">5.3 竞争格局</h3>
            <p>当地医疗市场竞争格局呈现"公立为主、民营补充"的特点。全市共有三级医院8家（其中公立5家、民营3家），二级医院15家，一级医院及社区卫生服务中心60余家。XX医院作为民营三级甲等医院，在市场中具有差异化竞争优势。</p>
            <p>从竞争态势来看，公立医院在品牌、人才、科研等方面具有传统优势，但在服务效率和患者体验方面存在不足。民营医院则在服务质量、就医环境、管理效率等方面具有优势。XX医院通过差异化定位、特色专科建设和优质服务，在激烈的市场竞争中保持了稳定的市场份额和良好的发展势头。</p>
          </div>
        </div>

<!-- 第六章：风险评估 -->
<div :id="'chapter-6'" class="chapter">
<h2 class="chapter-title">第六章 风险评估</h2>
<div :id="'section-6-1'" class="section">
<h3 class="section-title">6.1 信用风险</h3>
<p>信用风险是融资租赁业务面临的主要风险之一。通过对XX医院的信用状况进行综合评估，医院的信用风险总体可控。医院成立14年来，无重大违约记录，银行信用等级为A级。医院与多家银行保持了良好的合作关系，现有银行授信额度合计1.2亿元，已使用0.45亿元，剩余可用额度充足。</p>
<p>从还款能力来看，医院年经营性现金流净额0.32亿元，而本项目年租金支付额约0.11亿元，租金覆盖倍数约2.9倍，具备充足的还款能力。医院的应收账款回收情况良好，账龄在1年以内的应收账款占比92%，坏账风险较低。综合评估，信用风险等级为低风险。</p>
</div>
<div :id="'section-6-2'" class="section">
<h3 class="section-title">6.2 经营风险</h3>
<p>经营风险主要来自医院的日常运营管理。XX医院建立了较为完善的内部管理制度，包括财务管理制度、人力资源管理制度、医疗质量管理制度等。医院通过了ISO9001质量管理体系认证和JCI国际医院评审，管理水平处于行业较高水平。</p>
<p>潜在的经营风险包括：一是医疗纠纷风险，医院已购买医疗责任保险，年保费约50万元，保额5000万元；二是人才流失风险，医院通过有竞争力的薪酬体系和职业发展通道来留住核心人才；三是政策变化风险，医保支付方式改革可能对医院收入结构产生影响。总体而言，医院的经营风险处于可控范围内。</p>
</div>
<div :id="'section-6-3'" class="section">
<h3 class="section-title">6.3 市场风险</h3>
<p>市场风险主要来自外部市场环境的变化。当前医疗服务市场竞争日趋激烈，新进入者和替代服务可能对医院的市场份额产生影响。然而，医疗服务具有较强的区域性和专业性壁垒，短期内市场格局不会发生根本性变化。</p>
<p>此外，利率波动风险也需要关注。本项目采用固定利率，不受市场利率波动影响。设备技术更新风险方面，本次租赁的医疗设备技术成熟，预计在租赁期内不会出现重大技术替代。综合评估，市场风险等级为中低风险。</p>
</div>
<div :id="'section-6-4'" class="section">
<h3 class="section-title">6.4 合规风险</h3>
<p>合规风险主要涉及医院的资质合规性和业务合规性。经核查，XX医院持有有效的《医疗机构执业许可证》《营业执照》等必要资质证照，各项证照均在有效期内。医院的诊疗活动符合相关法律法规要求，近三年未受到卫生行政部门的行政处罚。</p>
<p>在环保合规方面，医院的医疗废物处理委托有资质的专业机构进行，污水处理设施运行正常，排放达标。在消防安全方面，医院通过了消防验收，定期开展消防演练。在数据安全方面，医院建立了患者信息保护制度，符合《个人信息保护法》要求。综合评估，合规风险等级为低风险。</p>
</div>
</div>

<!-- 第七章：综合评价 -->
<div :id="'chapter-7'" class="chapter">
<h2 class="chapter-title">第七章 综合评价</h2>
<div :id="'section-7-1'" class="section">
<h3 class="section-title">7.1 优势分析</h3>
<p>通过全面的尽职调查，XX医院具有以下显著优势：一是区位优势明显，医院位于城市核心医疗区域，交通便利，服务人口众多；二是品牌优势突出，医院作为三级甲等医院，在当地具有较高的知名度和美誉度；三是财务状况良好，医院盈利能力强，现金流充裕，偿债能力有保障。</p>
<p>四是管理团队稳定，核心管理层从业经验丰富，管理理念先进；五是学科建设成效显著，多个学科在区域内具有竞争优势；六是信息化水平较高，已建成较为完善的医院信息系统，运营效率持续提升。这些优势为融资租赁业务的顺利开展提供了有力支撑。</p>
</div>
<div :id="'section-7-2'" class="section">
<h3 class="section-title">7.2 劣势分析</h3>
<p>同时，我们也注意到医院存在一些需要关注的方面：一是作为民营医院，在科研能力和学术影响力方面与大型公立医院相比仍有差距；二是医院的负债水平虽在合理范围内，但如果加上本次融资租赁，资产负债率将上升至约52%，需要关注后续的债务管理。</p>
<p>三是医院的部分应收账款回收周期较长，主要是医保结算款项，平均回收周期约60天；四是医院在高端人才引进方面面临一定困难，与公立医院相比在编制、科研平台等方面缺乏吸引力。这些劣势虽不构成重大风险，但需要在后续的风险管理中予以关注。</p>
</div>
<div :id="'section-7-3'" class="section">
<h3 class="section-title">7.3 综合评分</h3>
<p>根据我公司的尽调评分体系，从财务状况（权重30%）、经营能力（权重25%）、行业前景（权重15%）、管理水平（权重15%）、信用记录（权重15%）五个维度对XX医院进行综合评分。财务状况得分85分，经营能力得分82分，行业前景得分88分，管理水平得分80分，信用记录得分90分。</p>
<p>加权计算后，XX医院的综合评分为84.6分，评级为"良好"（A级）。该评分表明医院整体状况良好，具备较强的履约能力和发展潜力，符合我公司融资租赁业务的准入标准。建议在标准风控措施的基础上，适当关注医院的负债水平变化和应收账款回收情况。</p>
</div>
</div>

<!-- 第八章：结论与建议 -->
<div :id="'chapter-8'" class="chapter">
<h2 class="chapter-title">第八章 结论与建议</h2>
<div :id="'section-8-1'" class="section">
<h3 class="section-title">8.1 尽调结论</h3>
<p>经过全面深入的尽职调查，我们认为XX医院是一家经营规范、财务状况良好、发展前景可期的综合性医疗机构。医院具备较强的租金支付能力，信用状况良好，各项风险总体可控。本次融资租赁项目的标的物为医院急需的医疗设备，项目具有合理的商业逻辑和明确的用途。</p>
<p>综合评估，我们认为本项目的整体风险水平为中低风险，建议予以审批通过。预计项目实施后，新设备将有效提升医院的诊疗能力和服务水平，带来增量收入，进一步增强医院的盈利能力和还款保障。</p>
</div>
<div :id="'section-8-2'" class="section">
<h3 class="section-title">8.2 风险提示</h3>
<p>尽管本项目整体风险可控，但仍需关注以下风险点：一是宏观经济下行可能影响医院的业务量和收入水平；二是医保政策调整可能影响医院的收入结构和利润率；三是医院负债水平上升后的偿债压力需要持续监控；四是医疗行业监管趋严可能增加医院的合规成本。</p>
<p>建议在合同中设置以下风控条款：要求医院定期提供财务报表，设置资产负债率不超过60%的财务约束条款，要求医院为租赁设备购买财产保险，设置交叉违约条款等。同时建议在租赁期间定期进行贷后检查，及时掌握医院的经营状况变化。</p>
</div>
<div :id="'section-8-3'" class="section">
<h3 class="section-title">8.3 业务建议</h3>
<p>基于本次尽职调查的结果，我们提出以下业务建议：一是建议批准本次融资租赁申请，租赁金额3000万元，期限36个月，利率6.5%；二是建议要求承租人提供不低于设备价值10%的首付款（300万元）；三是建议要求第一大股东张某某提供个人连带责任担保。</p>
<p>四是建议在合同中约定设备残值处理方式，租赁期满后承租人以名义价格留购；五是建议每半年进行一次贷后检查，重点关注医院的财务状况和设备使用情况；六是建议与医院建立长期合作关系，后续可在设备更新、科室建设等方面继续提供融资租赁服务，实现互利共赢。</p>
</div>
</div>
</div>

<!-- 右侧：参考数据 -->
<div class="ref-sidebar">
<el-card class="ref-card" shadow="never">
<template #header><span>项目信息</span></template>
<div class="ref-item"><span class="ref-label">项目名称</span><span class="ref-value">XX医院医疗设备融资租赁</span></div>
<div class="ref-item"><span class="ref-label">承租人</span><span class="ref-value">XX医院</span></div>
<div class="ref-item"><span class="ref-label">租赁金额</span><span class="ref-value">3,000万元</span></div>
<div class="ref-item"><span class="ref-label">租赁期限</span><span class="ref-value">36个月</span></div>
<div class="ref-item"><span class="ref-label">设备类型</span><span class="ref-value">医疗设备</span></div>
</el-card>
<el-card class="ref-card" shadow="never">
<template #header><span>财务指标</span></template>
<div class="ref-item"><span class="ref-label">资产总额</span><span class="ref-value">1.85亿元</span></div>
<div class="ref-item"><span class="ref-label">营业收入</span><span class="ref-value">2.35亿元</span></div>
<div class="ref-item"><span class="ref-label">净利润</span><span class="ref-value">0.22亿元</span></div>
<div class="ref-item"><span class="ref-label">资产负债率</span><span class="ref-value">47.6%</span></div>
<div class="ref-item"><span class="ref-label">流动比率</span><span class="ref-value">1.46</span></div>
</el-card>
<el-card class="ref-card" shadow="never">
<template #header><span>风险评分</span></template>
<div class="ref-item"><span class="ref-label">信用评分</span><span class="ref-value score-good">90分</span></div>
<div class="ref-item"><span class="ref-label">经营风险</span><span class="ref-value score-good">低</span></div>
<div class="ref-item"><span class="ref-label">市场风险</span><span class="ref-value score-mid">中低</span></div>
<div class="ref-item"><span class="ref-label">综合评级</span><span class="ref-value score-good">A级</span></div>
</el-card>
<el-card class="ref-card" shadow="never">
<template #header><span>行业数据</span></template>
<div class="ref-item"><span class="ref-label">行业增长率</span><span class="ref-value">12.5%</span></div>
<div class="ref-item"><span class="ref-label">市场份额</span><span class="ref-value">8.2%</span></div>
<div class="ref-item"><span class="ref-label">竞争指数</span><span class="ref-value">中等</span></div>
<div class="ref-item"><span class="ref-label">政策支持度</span><span class="ref-value score-good">高</span></div>
</el-card>
</div>
</div>
</div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 报告数据
const reportData = reactive({
  id: route.params.id,
  projectName: 'XX医院医疗设备融资租赁',
  status: '已完成',
  createTime: '2024-01-15'
})

// 当前激活的章节和小节
const activeChapter = ref(1)
const activeSection = ref('section-1-1')

// 报告主内容区域引用
const reportMainRef = ref<HTMLElement>()

// 章节目录结构
const chapters = [
  {
    id: 1,
    title: '第一章 项目概况',
    sections: [
      { id: 'section-1-1', title: '1.1 基本信息' },
      { id: 'section-1-2', title: '1.2 项目背景' },
      { id: 'section-1-3', title: '1.3 租赁方案' }
    ]
  },
  {
    id: 2,
    title: '第二章 承租人基本情况',
    sections: [
      { id: 'section-2-1', title: '2.1 企业信息' },
      { id: 'section-2-2', title: '2.2 股权结构' },
      { id: 'section-2-3', title: '2.3 经营范围' }
    ]
  },
  {
    id: 3,
    title: '第三章 财务状况分析',
    sections: [
      { id: 'section-3-1', title: '3.1 资产负债分析' },
      { id: 'section-3-2', title: '3.2 盈利能力分析' },
      { id: 'section-3-3', title: '3.3 现金流分析' },
      { id: 'section-3-4', title: '3.4 财务指标汇总' }
    ]
  },
  {
    id: 4,
    title: '第四章 经营状况分析',
    sections: [
      { id: 'section-4-1', title: '4.1 业务模式' },
      { id: 'section-4-2', title: '4.2 市场地位' },
      { id: 'section-4-3', title: '4.3 核心竞争力' }
    ]
  },
  {
    id: 5,
    title: '第五章 行业分析',
    sections: [
      { id: 'section-5-1', title: '5.1 行业概况' },
      { id: 'section-5-2', title: '5.2 市场规模' },
      { id: 'section-5-3', title: '5.3 竞争格局' }
    ]
  },
  {
    id: 6,
    title: '第六章 风险评估',
    sections: [
      { id: 'section-6-1', title: '6.1 信用风险' },
      { id: 'section-6-2', title: '6.2 经营风险' },
      { id: 'section-6-3', title: '6.3 市场风险' },
      { id: 'section-6-4', title: '6.4 合规风险' }
    ]
  },
  {
    id: 7,
    title: '第七章 综合评价',
    sections: [
      { id: 'section-7-1', title: '7.1 优势分析' },
      { id: 'section-7-2', title: '7.2 劣势分析' },
      { id: 'section-7-3', title: '7.3 综合评分' }
    ]
  },
  {
    id: 8,
    title: '第八章 结论与建议',
    sections: [
      { id: 'section-8-1', title: '8.1 尽调结论' },
      { id: 'section-8-2', title: '8.2 风险提示' },
      { id: 'section-8-3', title: '8.3 业务建议' }
    ]
  }
]

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    '草稿': 'info',
    '资料收集中': 'warning',
    '分析中': 'warning',
    '生成中': 'warning',
    '待审核': 'primary',
    '已完成': 'success'
  }
  return typeMap[status] || 'info'
}

// 返回列表
const goBack = () => {
  router.push('/due-diligence')
}

// 保存报告
const saveReport = () => {
  ElMessage.success('报告保存成功')
}

// 导出Word
const exportWord = () => {
  ElMessage.success('正在导出Word文档...')
}

// 导出PDF
const exportPDF = () => {
  ElMessage.success('正在导出PDF文档...')
}

// 滚动到指定章节
const scrollToChapter = (chapterId: number) => {
  const element = document.getElementById(`chapter-${chapterId}`)
  if (element && reportMainRef.value) {
    const offsetTop = element.offsetTop - reportMainRef.value.offsetTop - 20
    reportMainRef.value.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
  }
}

// 滚动到指定小节
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element && reportMainRef.value) {
    const offsetTop = element.offsetTop - reportMainRef.value.offsetTop - 20
    reportMainRef.value.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
  }
}

// 处理滚动事件，更新当前激活的章节和小节
const handleScroll = () => {
  if (!reportMainRef.value) return
  
  const scrollTop = reportMainRef.value.scrollTop
  const offset = 100 // 偏移量，提前高亮
  
  // 查找当前可见的章节和小节
  for (let i = chapters.length - 1; i >= 0; i--) {
    const chapter = chapters[i]
    const chapterElement = document.getElementById(`chapter-${chapter.id}`)
    if (chapterElement) {
      const chapterTop = chapterElement.offsetTop - reportMainRef.value.offsetTop
      if (scrollTop + offset >= chapterTop) {
        activeChapter.value = chapter.id
        
        // 查找当前章节内的小节
        for (let j = chapter.sections.length - 1; j >= 0; j--) {
          const section = chapter.sections[j]
          const sectionElement = document.getElementById(section.id)
          if (sectionElement) {
            const sectionTop = sectionElement.offsetTop - reportMainRef.value.offsetTop
            if (scrollTop + offset >= sectionTop) {
              activeSection.value = section.id
              break
            }
          }
        }
        break
      }
    }
  }
}

onMounted(() => {
  // 初始化时滚动到顶部
  nextTick(() => {
    if (reportMainRef.value) {
      reportMainRef.value.scrollTop = 0
    }
  })
})
</script>

<style scoped>
.due-diligence-report {
  padding: 20px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.report-content {
  display: flex;
  gap: 16px;
  height: calc(100vh - 200px);
}

/* 左侧目录 */
.toc-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
  padding: 16px 0;
}

.toc-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding: 0 16px 12px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 8px;
}

.toc-chapter {
  margin-bottom: 4px;
}

.toc-chapter .chapter-title {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.toc-chapter .chapter-title:hover {
  color: #FF6600;
  background: #fff7f0;
}

.toc-chapter.active > .chapter-title {
  color: #FF6600;
  font-weight: 600;
  border-left-color: #FF6600;
  background: #fff7f0;
}

.toc-sections {
  padding-left: 12px;
}

.toc-section {
  padding: 5px 16px;
  font-size: 12px;
  color: #909399;
  cursor: pointer;
  transition: all 0.2s;
}

.toc-section:hover {
  color: #FF6600;
}

.toc-section.active {
  color: #FF6600;
  font-weight: 500;
}

/* 中间报告内容 */
.report-main {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
  padding: 32px 40px;
}

.chapter {
  margin-bottom: 40px;
}

.chapter > .chapter-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #FF6600;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
}

.section p {
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  margin: 0 0 10px;
  text-indent: 2em;
  text-align: justify;
}

/* 右侧参考数据 */
.ref-sidebar {
  width: 280px;
  flex-shrink: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ref-card {
  border-radius: 8px;
}

.ref-card :deep(.el-card__header) {
  padding: 12px 16px;
  background: #fff7f0;
  font-weight: 600;
  font-size: 14px;
  color: #FF6600;
  border-bottom: 1px solid #ffe0c0;
}

.ref-card :deep(.el-card__body) {
  padding: 12px 16px;
}

.ref-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed #ebeef5;
}

.ref-item:last-child {
  border-bottom: none;
}

.ref-label {
  font-size: 13px;
  color: #909399;
}

.ref-value {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.ref-value.score-good {
  color: #67c23a;
}

.ref-value.score-mid {
  color: #e6a23c;
}

/* 按钮样式 */
:deep(.el-button--primary:not(.is-link)) {
  background-color: #FF6600;
  border-color: #FF6600;
}

:deep(.el-button--primary:not(.is-link)):hover {
  background-color: #ff8533;
  border-color: #ff8533;
}

/* 滚动条美化 */
.toc-sidebar::-webkit-scrollbar,
.report-main::-webkit-scrollbar,
.ref-sidebar::-webkit-scrollbar {
  width: 4px;
}

.toc-sidebar::-webkit-scrollbar-thumb,
.report-main::-webkit-scrollbar-thumb,
.ref-sidebar::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

.toc-sidebar::-webkit-scrollbar-thumb:hover,
.report-main::-webkit-scrollbar-thumb:hover,
.ref-sidebar::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}
</style>
