import direct.directbase.DirectStart 
from panda3d.core import * 
from panda3d.bullet import * 
from direct.task import Task 
from direct.showbase.InputStateGlobal import inputState 
import random 

# ===================== 初始化物理世界 ===================== 
base.setFrameRateMeter(True)  # 显示帧率 
base.cam.setPos(0, -50, 20)    # 摄像机位置（俯视视角） 
base.cam.lookAt(0, 0, 0)       # 摄像机朝向场地中心 

# 创建物理世界 
physicsWorld = BulletWorld() 
physicsWorld.setGravity(Vec3(0, 0, -9.81))  # 重力 

# ===================== 创建3D场景元素 ===================== 
# 1. 足球场（平面） 
field = render.attachNewNode("field") 
cm = CardMaker("field") 
cm.setFrame(-20, 20, -30, 30)  # 场地大小 
fieldGeom = cm.generate() 
fieldNode = field.attachNewNode(fieldGeom) 
field.setPos(0, 0, -1) 
field.setH(90)  # 旋转90度使其水平 
field.setColor(0.2, 0.8, 0.2, 1)  # 绿色 
# 给场地添加物理刚体（静态） 
fieldShape = BulletBoxShape(Vec3(20, 30, 0.5)) 
fieldBody = BulletRigidBodyNode("field") 
fieldBody.addShape(fieldShape) 
fieldBody.setMass(0)  # 质量0=静态物体 
fieldBodyNP = render.attachNewNode(fieldBody) 
fieldBodyNP.setPos(0, 0, -1) 
physicsWorld.attachRigidBody(fieldBody) 

# 2. 球门（左右各一个，简化为立方体） 
# 左侧球门（防守方，AI守护） 
goal_left = render.attachNewNode("goal_left") 
cm_goal = CardMaker("goal_left") 
cm_goal.setFrame(-4, 4, -3, 3)  # 球门大小 
goalLeftGeom = cm_goal.generate() 
goalLeftNode = goal_left.attachNewNode(goalLeftGeom) 
goal_left.setPos(-20, 0, 2) 
goal_left.setColor(1, 1, 1, 1)  # 白色 
# 右侧球门（进攻方，玩家目标） 
goal_right = render.attachNewNode("goal_right") 
cm_goal_right = CardMaker("goal_right") 
cm_goal_right.setFrame(-4, 4, -3, 3)  # 球门大小 
goalRightGeom = cm_goal_right.generate() 
goalRightNode = goal_right.attachNewNode(goalRightGeom) 
goal_right.setPos(20, 0, 2) 
goal_right.setColor(1, 1, 1, 1) 

# 3. 足球（球体） 
ball = render.attachNewNode("ball") 
# 创建一个简单的球体（使用CardMaker创建多个面） 
ballModel = render.attachNewNode("ball_model") 
for i in range(8):
    angle = i * 45
    cm = CardMaker(f"ball_slice_{i}")
    cm.setFrame(-1.5, 1.5, -1.5, 1.5)
    slice = cm.generate()
    sliceNode = ballModel.attachNewNode(slice)
    sliceNode.setH(angle)
    sliceNode.setP(45)
ballModel.setPos(0, 0, 2)
ballModel.setColor(1, 1, 1, 1)  # 白色
ballModel.reparentTo(ball)
# 足球物理刚体 
ballShape = BulletSphereShape(1.5) 
ballBody = BulletRigidBodyNode("ball") 
ballBody.addShape(ballShape) 
ballBody.setMass(1)  # 质量1（受重力/碰撞影响） 
ballBody.setFriction(0.8)  # 摩擦力 
ballBody.setRestitution(0.5)  # 弹性 
ballBodyNP = render.attachNewNode(ballBody) 
ballBodyNP.setPos(0, 0, 2) 
physicsWorld.attachRigidBody(ballBody) 

# 4. 玩家机器人（进攻方，红色） 
player_bot = render.attachNewNode("player_bot") 
# 创建一个简单的立方体 
playerModel = render.attachNewNode("player_model") 
cm = CardMaker("player_front")
cm.setFrame(-1.5, 1.5, -1.5, 1.5)
front = cm.generate()
frontNode = playerModel.attachNewNode(front)
frontNode.setPos(0, 1.5, 0)

cm = CardMaker("player_back")
cm.setFrame(-1.5, 1.5, -1.5, 1.5)
back = cm.generate()
backNode = playerModel.attachNewNode(back)
backNode.setPos(0, -1.5, 0)
backNode.setH(180)

cm = CardMaker("player_left")
cm.setFrame(-1.5, 1.5, -1.5, 1.5)
left = cm.generate()
leftNode = playerModel.attachNewNode(left)
leftNode.setPos(-1.5, 0, 0)
leftNode.setH(90)

cm = CardMaker("player_right")
cm.setFrame(-1.5, 1.5, -1.5, 1.5)
right = cm.generate()
rightNode = playerModel.attachNewNode(right)
rightNode.setPos(1.5, 0, 0)
rightNode.setH(-90)

cm = CardMaker("player_top")
cm.setFrame(-1.5, 1.5, -1.5, 1.5)
top = cm.generate()
topNode = playerModel.attachNewNode(top)
topNode.setPos(0, 0, 1.5)
topNode.setP(90)

cm = CardMaker("player_bottom")
cm.setFrame(-1.5, 1.5, -1.5, 1.5)
bottom = cm.generate()
bottomNode = playerModel.attachNewNode(bottom)
bottomNode.setPos(0, 0, -1.5)
bottomNode.setP(-90)

playerModel.setPos(-15, 0, 2)
playerModel.setColor(1, 0, 0, 1)  # 红色
playerModel.reparentTo(player_bot)
# 玩家机器人物理刚体 
playerShape = BulletBoxShape(Vec3(1.5, 1.5, 1.5)) 
playerBody = BulletRigidBodyNode("player") 
playerBody.addShape(playerShape) 
playerBody.setMass(5)  # 质量更大，更稳定 
playerBody.setFriction(1.0) 
playerBodyNP = render.attachNewNode(playerBody) 
playerBodyNP.setPos(-15, 0, 2) 
physicsWorld.attachRigidBody(playerBody) 

# 5. AI机器人（防守方，蓝色） 
ai_bot = render.attachNewNode("ai_bot") 
# 创建一个简单的立方体 
aiModel = render.attachNewNode("ai_model") 
cm = CardMaker("ai_front")
cm.setFrame(-1.5, 1.5, -1.5, 1.5)
front = cm.generate()
frontNode = aiModel.attachNewNode(front)
frontNode.setPos(0, 1.5, 0)

cm = CardMaker("ai_back")
cm.setFrame(-1.5, 1.5, -1.5, 1.5)
back = cm.generate()
backNode = aiModel.attachNewNode(back)
backNode.setPos(0, -1.5, 0)
backNode.setH(180)

cm = CardMaker("ai_left")
cm.setFrame(-1.5, 1.5, -1.5, 1.5)
left = cm.generate()
leftNode = aiModel.attachNewNode(left)
leftNode.setPos(-1.5, 0, 0)
leftNode.setH(90)

cm = CardMaker("ai_right")
cm.setFrame(-1.5, 1.5, -1.5, 1.5)
right = cm.generate()
rightNode = aiModel.attachNewNode(right)
rightNode.setPos(1.5, 0, 0)
rightNode.setH(-90)

cm = CardMaker("ai_top")
cm.setFrame(-1.5, 1.5, -1.5, 1.5)
top = cm.generate()
topNode = aiModel.attachNewNode(top)
topNode.setPos(0, 0, 1.5)
topNode.setP(90)

cm = CardMaker("ai_bottom")
cm.setFrame(-1.5, 1.5, -1.5, 1.5)
bottom = cm.generate()
bottomNode = aiModel.attachNewNode(bottom)
bottomNode.setPos(0, 0, -1.5)
bottomNode.setP(-90)

aiModel.setPos(15, 0, 2)
aiModel.setColor(0, 0, 1, 1)  # 蓝色
aiModel.reparentTo(ai_bot)
# AI机器人物理刚体 
aiShape = BulletBoxShape(Vec3(1.5, 1.5, 1.5)) 
aiBody = BulletRigidBodyNode("ai") 
aiBody.addShape(aiShape) 
aiBody.setMass(5) 
aiBody.setFriction(1.0) 
aiBodyNP = render.attachNewNode(aiBody) 
aiBodyNP.setPos(15, 0, 2) 
physicsWorld.attachRigidBody(aiBody) 

# ===================== 游戏逻辑 ===================== 
# 物理世界更新任务 
def updatePhysics(task):
    dt = globalClock.getDt()
    physicsWorld.doPhysics(dt)
    # 同步视觉模型位置
    ball.setPos(ballBody.getTransform().getPos())
    ball.setHpr(ballBody.getTransform().getHpr())
    player_bot.setPos(playerBody.getTransform().getPos())
    player_bot.setHpr(playerBody.getTransform().getHpr())
    ai_bot.setPos(aiBody.getTransform().getPos())
    ai_bot.setHpr(aiBody.getTransform().getHpr())
    return Task.cont

# 注册物理更新任务 
taskMgr.add(updatePhysics, "updatePhysics") 

# 玩家控制 
def handlePlayerInput():
    # 获取玩家当前速度
    playerVel = playerBody.getLinearVelocity()
    maxSpeed = 10.0  # 最大速度
    force = 50.0     # 施加的力
    
    # 重置水平方向速度（避免累积）
    playerBody.setLinearVelocity(Vec3(0, playerVel.getY(), playerVel.getZ()))
    
    # 方向键控制
    if inputState.isSet("up"):
        playerBody.applyCentralForce(Vec3(0, force, 0))
    if inputState.isSet("down"):
        playerBody.applyCentralForce(Vec3(0, -force, 0))
    if inputState.isSet("left"):
        playerBody.applyCentralForce(Vec3(-force, 0, 0))
    if inputState.isSet("right"):
        playerBody.applyCentralForce(Vec3(force, 0, 0))

# AI控制 
def handleAI():
    # 获取球和AI的位置
    ballPos = ballBody.getTransform().getPos()
    aiPos = aiBody.getTransform().getPos()
    
    # 计算AI到球的方向
    direction = ballPos - aiPos
    direction.setZ(0)  # 忽略Z轴
    distance = direction.length()
    
    # 如果球在AI前方，移动接近球
    if distance > 2.0:  # 保持一定距离
        direction.normalize()
        force = 40.0
        aiBody.applyCentralForce(direction * force)
    
    # 限制AI在场地右侧（防守区域）
    if aiPos.getX() < 0:
        aiBody.applyCentralForce(Vec3(50.0, 0, 0))

# 游戏主循环任务 
def gameLoop(task):
    handlePlayerInput()
    handleAI()
    checkGoal()
    return Task.cont

# 注册游戏主循环任务 
taskMgr.add(gameLoop, "gameLoop") 

# 检测进球 
def checkGoal():
    ballPos = ballBody.getTransform().getPos()
    
    # 检查是否进入左侧球门（AI防守）
    if ballPos.getX() < -16 and abs(ballPos.getY()) < 4 and ballPos.getZ() < 5:
        print("玩家进球！")
        resetBall()
    
    # 检查是否进入右侧球门（玩家防守）
    if ballPos.getX() > 16 and abs(ballPos.getY()) < 4 and ballPos.getZ() < 5:
        print("AI进球！")
        resetBall()

# 重置球的位置 
def resetBall():
    ballBody.setTransform(TransformState.makePos(Vec3(0, 0, 2)))
    ballBody.setLinearVelocity(Vec3(0, 0, 0))
    ballBody.setAngularVelocity(Vec3(0, 0, 0))
    ball.setPos(0, 0, 2)
    ball.setHpr(0, 0, 0)

# 注册输入事件 
inputState.watchWithModifiers('up', 'w')
inputState.watchWithModifiers('down', 's')
inputState.watchWithModifiers('left', 'a')
inputState.watchWithModifiers('right', 'd')

# 运行游戏 
run()