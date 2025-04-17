# 利用可能な情報

## 🔹 自機の情報（Self info）

- `@me.id`：自分のID  
- `@me.x`：現在のX座標  
- `@me.y`：現在のY座標  
- `@me.hp`：現在のHP（体力）  
- `@me.angle`：現在の角度（戦車本体の角度 + 砲塔の角度）  
- `@me.tank_angle`：戦車本体の角度  
- `@me.turret_angle`：砲塔の角度  

---

## 🔹 敵の情報（Enemy info）

- `@enemy-spot[N].id`：敵のID（Nはインデックス）  
- `@enemy-spot[N].hp`：敵のHP  
- `@enemy-spot[N].angle`：敵の方向（自分から見た角度）

---

# 順次アクション（Sequential Actions）

> これらのアクションは **順番に実行** されます。

- `@turn_left(angle)`：左に指定角度だけ回転  
- `@turn_right(angle)`：右に指定角度だけ回転  
- `@move_forwards(distance)`：前に指定距離だけ移動  
- `@move_backwards(distance)`：後ろに指定距離だけ移動  
- `@move_opposide(distance)`：逆方向に移動（**`OnWallCollide()` の中でのみ使用可能**）

---

# 並列アクション（Parallel Actions）

> これらのアクションは **他の動作と同時に実行可能** です。

- `@turn_turret_left(angle)`：砲塔を左に回転  
- `@turn_turret_right(angle)`：砲塔を右に回転  
- `@shoot()`：発射（攻撃）  
- `@yell(message)`：メッセージを叫ぶ（ログ出力などに利用）

---

# イベント（Events）

> 以下のイベント関数を **オーバーライド（上書き）** して使用します。

- `OnIdle()`：待機状態のときに呼び出される（**必須実装**）  
- `OnWallCollide()`：壁に衝突したときに発生  
- `OnHit()`：敵の弾に当たったときに発生  
- `OnEnemySpot()`：砲塔が敵を正面に捉えたときに発生（**撃たない理由はない！**）

---
