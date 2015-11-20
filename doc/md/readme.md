% Phoenix Framework
% Ruby舞鶴
% November 23 2015

# Who am I?

## Who am I?

- 近藤 茂 (twitter: @subcigel, github: cncgl)
- フリーエンジニア
- 主にバックエンドとフロントエンド
- 10年ぐらいのブランクがある(ほぼ新人)

# About

## Phoenix Framework とは

- Elixir による Web Application Framework
- 作者が Rails コミッターであり、Ruby on Rails ライクなつくり
- Erlang VM 上で動き、高速且つ堅牢


# インストール

## Elixir のインストール

- OSX

```
$ brew install elixir
```

- Ubuntu

```
$ sudo apt-get install elixir
```

## Phoenix のインストール

```
$ mix local.hex
$ mix archive.install https://github.com/phoenixframework/phoenix/releases/download/v1.0.3/phoenix_new-1.0.3.ez
```


## PostgreSQL のインストール

```
$ sudo apt-get install PostgreSQL
$ sudo passwd PostgreSQL
新しい UNIX パスワードを入力してください: postgres
新しい UNIX パスワードを再入力してください: postgres
passwd: パスワードは正しく更新されました
$ sudo -u postgres psql
psql (9.4.5)
Type "help" for help.

postgres=# alter user postgres PASSWORD 'postgres';
ALTER ROLE
postgres=# \q
```

## inotify のインストール

```
$ sudo apt-get install inotify-tools
```

ファイルを監視して変更があればリロードします。

## Node.js のインストール

- nvm でインストールします。 (Mac はnodebrew からインストールする方法もあるが共通の手順でできるため)

```
$ git clone git://github.com/creationix/nvm.git ~/.nvm
```
- ログインシェルに追加する。

```bash
[[ -s "$HOME/.nvm/nvm.sh" ]] && source "$HOME/.nvm/nvm.sh"
```
- 最新版の node.js を取得する。

```
$ nvm ls-remote
$ nvm install v5.1.0
$ nvm use v5.1.0
```

## Phoenix プロジェクト生成

```
$ mix phoenix.new hello_phoenix
$ cd hello_phoenix
$ mix ecto.create
$ npm i
$ mix phoenix.server
```
http://localhost:4000/ にアクセス

![](../img/phoenix_welcome.png)


# 特徴

## Rails との違い


| Phoenix | Rails |
|---------|-------|
| mix | gem, rake, bundler |
| ecto | ActiveRecord |
| Plug | Rack |
| CowBoy | WEBrick |
| eex | erb |


# まとめ

## まとめ

- Rails を知っていれば抵抗なく使える
- 関数型プログラミングの勉強になる
- 置き換えにより高速化、堅牢化できる
