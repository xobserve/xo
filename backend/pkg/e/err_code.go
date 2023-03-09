package e

type Error struct {
	Status  int
	Message string
}

func New(status int, msg string) *Error {
	return &Error{
		Status:  status,
		Message: msg,
	}
}

const (
	Malicious          = "malicious"
	UserNotExist       = "user not exist"
	PasswordIncorrect  = "password incorrect"
	DB                 = "数据库异常"
	Internal           = "服务器内部错误"
	NeedLogin          = "你需要登录"
	NoEditorPermission = "只有编辑角色才能执行此操作"
	ParamInvalid       = "请求参数不正确"
	NotFound           = "目标不存在"
	NoPermission       = "no permission"
	NoAdminPermission  = "你需要管理员权限"
	BadRequest         = "非法操作"
	AlreadyExist       = "目标已经存在"

	// 标签类
	TagNotExist   = "标签不存在"
	DisabledByTag = "你的文章已经被禁，请在创作中心中，点击文章标题旁的标签，申请解封"

	// Teams
	TeamNotExist = "team not exist"

	// users
	UsernameOrPasswordEmpty = "user name or password empty"
)
